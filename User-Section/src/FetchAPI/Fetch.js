import axios from "axios";

const API_URL_COMMON = "http://localhost:3000/common";
const API_URL_USER = "http://localhost:3000/user";

export const fetchUserInfo = async () => {
    try {
        const response = await axios.get(`${API_URL_USER}/userInfo`, {
            withCredentials: true,
        });

        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateUserInfo = async (formData) => {
    try {
        const response = await axios.put(`${API_URL_USER}/userInfo`, formData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const changePassword = async ({ oldPassword, newPassword }) => {
    try {
        const response = await axios.post(
            `${API_URL_USER}/change-password`,
            { oldPassword, newPassword },
            { withCredentials: true }
        );

        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const fetchdataProduct = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProduct`)
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const fetchProductByName = async ({ phone_name }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getProduct?phone_name=${phone_name}`)
        // console.log({ phone_name });

        return response.data;
    } catch (error) {
        console.log(error);

    }
}
export const fetchProductDiscount = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/offerDisplay`);

        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const fetchProductByDate = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductbydate?date=6`);
        return response.data;
    } catch (error) {
        console.log(error);

    }
}
export const fetchCategory = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/category`);
        return response.data;
    } catch (error) {
        console.log(error);

    }
}
export const fetchBrand = async () => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/brand`);
        return response.data;
    } catch (error) {
        console.log(error);

    }
}

export const fetchSearchDataByName = async ({ phone_name }) => {
    try {
        const response = await axios.get(`${API_URL_COMMON}/getAllProductByName?phone_name=${phone_name}`)
        return response.data;
    } catch (error) {
        console.log(error);

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
        console.log(error);

    }
}
export const fetchCheckOut = async (data) => {
    try {
        const response = await axios.post(`${API_URL_USER}/checkout`, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        return response;
        // console.log(data);

    } catch (error) {
        console.log(error);

    }

}