import axios from "axios";
import { NETWORK_CONFIG } from "../network/Network_EndPoint";

const API_URL_COMMON = `${NETWORK_CONFIG.apiBaseUrl}/common`;
const API_URL_USER = `${NETWORK_CONFIG.apiBaseUrl}/user`;

export const fetchUserInfo = async () => {
    const response = await axios.get(`${API_URL_USER}/userInfo`, {
        withCredentials: true,
    });

    return response.data;
}

export const updateUserInfo = async (formData) => {
    const response = await axios.put(`${API_URL_USER}/userInfo`, formData, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

export const changePassword = async ({ oldPassword, newPassword }) => {
    const response = await axios.post(
        `${API_URL_USER}/change-password`,
        { oldPassword, newPassword },
        { withCredentials: true }
    );

    return response.data;
}

export const fetchdataProduct = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProduct`)
        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchProductByName = async ({ phone_name, phone_id }) => {
    try {
        const params = new URLSearchParams();

        if (phone_id) {
            params.set("phone_id", phone_id);
        }

        if (phone_name) {
            params.set("phone_name", phone_name);
        }

        const response = await axios.get(`${API_URL_COMMON}/getProduct?${params.toString()}`)

        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchProductDiscount = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/offerDisplay`);

        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchProductByDate = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductbydate?date=6`);
        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchCategory = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/category`);
        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchBrand = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/brand`);
        return response.data;
    } catch (error) {
      console.error(error);
    }
}

export const fetchSearchDataByName = async ({ phone_name }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductByName?phone_name=${phone_name}`)
        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchProductByCategory = async ({ category }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductbyCategory?category=${category}`);
        return response.data;
    } catch (error) {
        console.error(error);

    }
}
export const fetchProductByBrand = async ({ brand }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductbyBrand?brand=${brand}`);
        return response.data;
    } catch (error) {
        console.error(error);

    }
}
export const fetchProductBySpecID = async ({ spec_id }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getOneItemBySpecID?spec_id=${spec_id}`)
        return response.data;
    } catch (error) {
      console.error(error);
    }
}
export const fetchCheckOut = async (data) => {
    const response = await axios.post(`${API_URL_USER}/checkout`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
    });
    return response;
}

// ─── Bakong KHQR Payment ──────────────────────────────────────────────────────
export const generateBakongQR = async ({ amount, currency = "USD", items, delivery, location, customerName }) => {
    const response = await axios.post(`${API_URL_USER}/bakong/generate-qr`, {
        amount,
        currency,
        items,
        delivery,
        location,
        customerName
    }, { withCredentials: true });
    return response.data;
};

export const checkBakongPayment = async ({ md5Hash, orderId }) => {
    const response = await axios.post(`${API_URL_USER}/bakong/check-payment`, {
        md5Hash,
        orderId
    }, { withCredentials: true });
    return response.data;
};

export const generateBakongToken = async () => {
    const response = await axios.post(`${API_URL_USER}/bakong/generate-token`, {}, {
        withCredentials: true
    });
    return response.data;
};
