import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { checkBakongPayment, generateBakongQR } from "../FetchAPI/Fetch";

const EXPIRY_SECONDS = 300; // 5 minutes

// orderData = { items, delivery, payment, location, customerName }
const BakongQR = ({ amount, orderData, onPaymentSuccess, onCancel }) => {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
    const [checking, setChecking] = useState(false);
    const [paid, setPaid] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const timerRef = useRef(null);
    const md5Ref = useRef(null);
    const hasGeneratedRef = useRef(false); // Prevent duplicate calls

    useEffect(() => {
        // Prevent duplicate calls in React StrictMode
        if (hasGeneratedRef.current) return;
        hasGeneratedRef.current = true;
        
        doGenerateQR();
        return () => {
            clearInterval(timerRef.current);
        };
    }, []);

    const doGenerateQR = async () => {
        setLoading(true);
        setError("");
        setTimeLeft(EXPIRY_SECONDS);
        setPaid(false);
        setQrData(null);
        try {
            // Generate QR + create order in one call
            const data = await generateBakongQR({
                amount,
                currency: "USD",
                items: orderData.items,
                delivery: orderData.delivery,
                location: orderData.location,
                customerName: orderData.customerName
            });
            
            setQrData(data.data);
            md5Ref.current = data.data.md5Hash;
            setOrderId(data.data.orderId);
            
            // Start payment check (backend will poll for 5 minutes)
            checkPaymentStatus(data.data.md5Hash, data.data.orderId);
            startTimer();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to generate QR. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        clearInterval(timerRef.current);
        let seconds = EXPIRY_SECONDS;
        timerRef.current = setInterval(() => {
            seconds -= 1;
            setTimeLeft(seconds);
            if (seconds <= 0) {
                clearInterval(timerRef.current);
                setError("QR code expired. Please generate a new one.");
            }
        }, 1000);
    };

    const checkPaymentStatus = async (md5Hash, orderId) => {
        try {
            setChecking(true);
            
            // Backend will poll for 5 minutes and return when payment is confirmed or timeout
            const result = await checkBakongPayment({
                md5Hash,
                orderId
            });

            if (result.paid) {
                clearInterval(timerRef.current);
                setPaid(true);
                setOrderId(result.orderId);
                if (onPaymentSuccess) {
                    onPaymentSuccess({
                        orderId: result.orderId,
                        transaction: result.transaction
                    });
                }
            } else if (result.timeout) {
                setError("Payment timeout. Your order is saved as pending. Please contact support if you completed the payment.");
            } else {
                setError(result.message || "Payment verification failed");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Payment check failed";
            setError(msg);
        } finally {
            setChecking(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // ── Payment confirmed screen ──
    if (paid) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-2xl border border-green-200 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Confirmed!</h3>
                <p className="text-green-600 mb-1">Your Bakong payment was received successfully.</p>
                {orderId && (
                    <p className="text-sm text-slate-500 mt-2">Order ID: <strong>#{orderId}</strong></p>
                )}
            </div>
        );
    }

    // ── Loading screen ──
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-600">Generating QR code and creating order...</p>
            </div>
        );
    }

    // ── Error before QR generated ──
    if (error && !qrData) {
        return (
            <div className="flex flex-col items-center p-6 bg-red-50 rounded-2xl border border-red-200">
                <p className="text-red-600 font-medium mb-4 text-center">{error}</p>
                <button type="button" onClick={doGenerateQR}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                    Try Again
                </button>
            </div>
        );
    }

    // ── QR display ──
    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-sm">B</span>
                </div>
                <div>
                    <p className="font-bold text-slate-800">Bakong KHQR</p>
                    <p className="text-xs text-slate-500">Scan with any Cambodian banking app</p>
                </div>
            </div>

            {/* Order ID */}
            {orderId && (
                <div className="mb-2 text-center">
                    <p className="text-xs text-slate-400">Order #{orderId}</p>
                </div>
            )}

            {/* Amount */}
            <div className="mb-4 text-center">
                <p className="text-3xl font-extrabold text-green-600">${parseFloat(amount).toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-0.5">USD — {orderData?.items?.length || 0} item(s)</p>
            </div>

            {/* QR Code */}
            {qrData?.qrString && (
                <div className="p-3 bg-white border-2 border-slate-200 rounded-xl mb-4">
                    <QRCodeSVG value={qrData.qrString} size={220} level="M" includeMargin={true} />
                </div>
            )}

            {/* Timer */}
            <div className={`flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
                timeLeft <= 60 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
            }`}>
                <span>⏱</span>
                <span>Expires in {formatTime(timeLeft)}</span>
            </div>

            {/* Checking indicator */}
            {checking && !error && (
                <div className="flex flex-col items-center mb-3">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-slate-400 animate-pulse">Waiting for payment...</p>
                    <p className="text-xs text-slate-300 mt-1">This may take up to 5 minutes</p>
                </div>
            )}

            {/* Error / status message */}
            {error && (
                <div className="w-full mb-3 text-center">
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                    {error.includes("expired") && (
                        <button type="button" onClick={doGenerateQR}
                            className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-sm">
                            Generate New QR
                        </button>
                    )}
                    {error.includes("timeout") && orderId && (
                        <p className="text-xs text-slate-400 mt-2">
                            Your order #{orderId} has been saved. If you completed the payment, please contact support.
                        </p>
                    )}
                    {error.includes("token") && (
                        <p className="text-xs text-slate-400 mt-1">
                            Admin needs to add BAKONG_TOKEN to the server .env file.
                            Your order has been saved — payment can be verified manually.
                        </p>
                    )}
                </div>
            )}

            {/* Instructions */}
            <div className="w-full bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1 mb-4">
                <p>1. Open your banking app (ABA, ACLEDA, Wing, etc.)</p>
                <p>2. Tap <strong>Scan QR</strong> or <strong>Pay</strong></p>
                <p>3. Scan this QR code and confirm the amount</p>
                <p>4. Wait for confirmation (automatic) ✅</p>
            </div>

            {/* Cancel */}
            <button type="button"
                onClick={() => {
                    clearInterval(timerRef.current);
                    if (onCancel) onCancel();
                }}
                className="text-sm text-slate-400 hover:text-slate-600 underline transition"
                disabled={checking}>
                {checking ? "Please wait..." : "Cancel and go back"}
            </button>
        </div>
    );
};

export default BakongQR;
