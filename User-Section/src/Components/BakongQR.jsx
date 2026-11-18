import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { FiCheck } from "react-icons/fi";
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
            setError(err?.response?.data?.message || "Couldn\u2019t create the QR code. Please try again");
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

    const panel = "card w-full p-6 shadow-float";
    const shownAmount = Number(qrData?.amount ?? amount);

    if (paid) {
        return (
            <div className={`${panel} text-center`}>
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <FiCheck size={18} strokeWidth={1.5} />
                </span>
                <p className="mt-4 text-base text-ink">Payment received</p>
                {orderId && <p className="price mt-1 text-[13px] text-ink-3">Order #{orderId}</p>}
            </div>
        );
    }

    if (loading) {
        return <div className={`${panel} py-12 text-center text-sm text-ink-3`}>Creating your QR code</div>;
    }

    if (error && !qrData) {
        return (
            <div className={`${panel} text-center`}>
                <p className="text-sm text-ink">{error}</p>
                <div className="mt-5 flex justify-center gap-2">
                    <button type="button" onClick={onCancel} className="btn btn-secondary">Back</button>
                    <button type="button" onClick={doGenerateQR} className="btn btn-dark">Try again</button>
                </div>
            </div>
        );
    }

    return (
        <div className={panel}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-ink">Pay with Bakong KHQR</p>
                    <p className="mt-0.5 text-[13px] text-ink-3">Scan with ABA, ACLEDA, Wing or any KHQR app</p>
                </div>
                {orderId && <span className="price text-xs text-ink-3">#{orderId}</span>}
            </div>

            <div className="mt-6 flex flex-col items-center">
                {qrData?.qrString && (
                    <div className="rounded-xl border border-line p-3">
                        <QRCodeSVG value={qrData.qrString} size={216} level="M" />
                    </div>
                )}
                <p className="price mt-5 text-[28px] leading-none text-ink">${shownAmount.toFixed(2)}</p>
                <p className={`price mt-2 text-[13px] ${timeLeft <= 60 ? "text-danger" : "text-ink-3"}`}>
                    Expires in {formatTime(timeLeft)}
                </p>
            </div>

            {checking && !error && (
                <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-ink-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    Waiting for your payment, this updates by itself
                </p>
            )}

            {error && (
                <div className="mt-5 rounded-lg bg-danger-soft p-3 text-[13px] text-danger">
                    <p>{error}</p>
                    {error.includes("expired") && (
                        <button type="button" onClick={doGenerateQR} className="mt-2 underline underline-offset-2">New QR code</button>
                    )}
                    {(error.includes("timeout") || error.includes("token")) && orderId && (
                        <p className="mt-1 text-ink-2">
                            Order #{orderId} is saved. If you already paid, call 096 888 750 and we&apos;ll confirm it.
                        </p>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => {
                    clearInterval(timerRef.current);
                    if (onCancel) onCancel();
                }}
                className="btn btn-ghost mt-5 w-full"
                disabled={checking}
            >
                {checking ? "Checking payment" : "Cancel"}
            </button>
        </div>
    );
};

export default BakongQR;
