import axios from "axios";
import Cookies from "js-cookie";

const API_URL_Auth = "http://localhost:3000/auth";
// const API_URL2 = 'http://localhost:3000/user/functionality';
const API_URL_Admin = "http://localhost:3000/admin";
const API_URL_COMMON = "http://localhost:3000/common";

export const signIn = async ({ email, password }) => {
  return axios.post(`${API_URL_Auth}/login`, { email, password }, { withCredentials: true });
};
export const register = async ({ username, email, password }) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);

  return axios.post(`${API_URL_Auth}/adminRegister`, formData, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true
  });
};
export const productData = async () => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/getAllProduct`);
    return response; // return the data from the response
  } catch (error) {
    console.error("Error fetching product data:", error);
    throw error; // Rethrow the error so it can be handled by the caller
  }
};
export const adminLogin = async ({ email, password }) => {
  try {
    // Prepare the data to be sent as JSON
    const data = { email, password };

    // Send a POST request with JSON data
    const response = await axios.post(`${API_URL_Auth}/adminLogin`, data, {
      headers: {
        "Content-Type": "application/json", // Use JSON for the body content
      },
      withCredentials: true
    });

    // Return the response (can be useful to handle the response in the component)
    return response.data;
  } catch (error) {
    console.error("Login error:", error);

    // If the error is an Axios error, handle it accordingly
    if (error.response) {
      // Server responded with an error status code
      return error.response.data;
    } else {
      // Other errors (e.g., network issues)
      return { message: "An error occurred, please try again." };
    }
  }
};
export const productHeaderData = async () => {
  try {
    const response = await axios.get(`${API_URL_Admin}/productHead`, { withCredentials: true });

    return response;
  } catch (error) {
    console.log(error);
  }
}

export const dashboardHeaderData = async (date) => {
  try {
    const response = await axios.get(`${API_URL_Admin}/dashboardHead`, {
      params: { date },
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.log(error);
  }
}
export const dashboardHeaderAll = async () => {
  try {
    const response = await axios.get(`${API_URL_Admin}/dashboardHeadAll`, { withCredentials: true });
    return response;
  } catch (error) {
    console.log(error);
  }
}

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL_COMMON}/notification`, {
    withCredentials: true,
  });

  return response.data;
};

export const createNotification = async ({ title, message }) => {
  const response = await axios.post(
    `${API_URL_COMMON}/notification`,
    { title, message },
    { withCredentials: true }
  );

  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axios.delete(`${API_URL_COMMON}/notification/${id}`, {
    withCredentials: true,
  });

  return response.data;
};

export const tableByDate = async (date) => {

  try {
    console.log(date);

    const response = await axios.get(`${API_URL_COMMON}/getAllProductbydate?date=${date}`, {
      withCredentials: true
    })

    return response;
  } catch (error) {
    console.log(error);
  }
}

export const categoryFetch = async () => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/category`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
export const brandFetch = async () => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/brand`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
export const tableByCategory = async (category) => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/getAllProductbyCategory`, {
      params: category,
      withCredentials: true
    });


    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export const searchFetchByCategory = async ({ searchData, Category }) => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/searchProduct?searchData=${searchData}&Category=${Category}`, {
      withCredentials: true
    });
    console.log(response);

    return response.data; // Explicitly return data
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.data.data);
    } else if (error.request) {
      console.error("No Response:", error.request);
    } else {
      console.error("Setup Error:", error.message);
    }
    throw error; // Re-throw error if the caller needs to handle it
  }
};
export const searchOrder = async ({ username }) => {
  try {
    const UserName = `%${username}%`
    const response = await axios.get(`${API_URL_Admin}/searchTableOrder?username=${UserName}`, { withCredentials: true })
    return response.data;

  } catch (error) {
    console.log(error);

  }
}
export const addNewProductAPI = async (formdata) => {
  const formData = new FormData();

  // Append non-file data to formData
  formData.append("name", formdata.name);
  formData.append("brand", formdata.brand);
  formData.append("price", formdata.price);
  formData.append("date", formdata.date);
  formData.append("processor", formdata.processor);
  formData.append("storage", formdata.storage);
  formData.append("camera", formdata.camera);
  formData.append("category", formdata.category);
  formData.append("description", formdata.description);
  formData.append("stock", formdata.stock);
  formData.append("screenSize", formdata.screenSize);
  formData.append("ram", formdata.ram);
  formData.append("battery", formdata.battery);
  formData.append("colors", formdata.colors);




  // Append `images` (files) to formData
  for (let image of formdata.images) {
    formData.append("images", image); // The key `images` must match the backend
  }

  try {
    const response = await axios.post(`${API_URL_Admin}/addNewProduct`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure this matches your backend
      },
      withCredentials: true
    });
    return response;
    // console.log(formdata);


  } catch (error) {
    console.log(error);

  }
}
export const addNewColorFetch = async (formdata) => {
  try {
    const formData = new FormData();
    formData.append('productName', formdata.productName);
    formData.append('color', formdata.color);
    formData.append('price', formdata.price);
    formData.append('stock', formdata.stock);
    for (let image of formdata.images) {
      formData.append('productImages', image)
    }
    const response = await axios.post(`${API_URL_Admin}/addNewVariants`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      withCredentials: true,
    })
    return response;
  } catch (error) {
    console.log(error);

  }
}
export const addNewBrandAPI = async (formdata) => {

  try {
    const response = await axios.post(`${API_URL_Admin}/addNewBrand`, formdata, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.log(error);


  }
}
export const addNewCategoryAPI = async (category) => {
  try {
    const response = await axios.post(`${API_URL_Admin}/addNewCategory`, { category }, { withCredentials: true });
    console.log("Response:", response.data); // Debugging logs
    return response;
  } catch (error) {
    console.error("Error in addNewCategoryAPI:", error);
    throw error;
  }
};

export const deleteBrandAPI = async (brand) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleteBrand?brand=${encodeURIComponent(brand)}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    const serverMessage = error.response?.data?.message || "Failed to delete brand";
    throw new Error(serverMessage);
  }
};

export const deleteCategoryAPI = async (category) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleteCategory?category=${encodeURIComponent(category)}`, {
      withCredentials: true,
    });
    return response;
  } catch (error) {
    const serverMessage = error.response?.data?.message || "Failed to delete category";
    throw new Error(serverMessage);
  }
};

export const addNewDetail = async ({ formdata }) => {
  try {
    const response = await axios.post(`${API_URL_Admin}/addNewSpecification`, { formdata }, {
      withCredentials: true
    })
    return response;
  } catch (error) {
    console.log(error);

  }
}
export const removeOneFetch = async ({ deleteid }) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleteProduct?deleteid=${deleteid}`, {
      withCredentials: true
    })
    return response;
  } catch (error) {
    console.log(error);

  }
}
export const removeVariants = async ({ deleteid }) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleteVariants?variants_id=${deleteid}`, {
      withCredentials: true
    })
    return response;


  } catch (error) {
    console.log(error);

  }
}
export const removeSpec = async (variantID, storage) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleleSpec?variantID=${variantID}&storage=${storage}`, {
      withCredentials: true
    })
    // console.log(variantID);
    // console.log(storage);

    return response;
  } catch (error) {
    console.log(error);

  }
}
export const removeOrder = async ({ deleteid }) => {
  try {
    console.log(`${API_URL_Admin}/deleleOrder/${deleteid}`);

    const response = await axios.delete(`${API_URL_Admin}/deleleOrder/${deleteid}`, { withCredentials: true })
    return response;
  } catch (error) {
    console.log(error);

  }

}
export const loginFetch = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL_Auth}/adminLogin`, { email, password }, { withCredentials: true });
    const token = response.data.token;
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    Cookies.set("token", token, { expires: 7, secure: isHttps, sameSite: "strict" });
    localStorage.setItem("adminToken", token);
    return response.data; // Return the response payload

  } catch (error) {
    console.error("Error during login request:", error.message);
    if (error.response) {
      console.error("Server responded with status:", error.response.status);
      console.error("Server response data:", error.response.data);
    }
    const serverMessage = error.response?.data?.message || "Login failed";
    throw new Error(serverMessage); // Pass server errors up the chain
  }
};

export const logoutFetch = async () => {
  try {
    const response = await axios.post(`${API_URL_Auth}/adminLogout`, {}, { withCredentials: true })
    return response;
  } catch (error) {
    console.log(error);
  }
}
export const OrderTableFetch = async () => {
  try {
    const response = await axios.get(`${API_URL_Admin}/tableOrder`, {
      withCredentials: true, // Move withCredentials to the second argument
    });
    return response;
  } catch (error) {
    console.error("Error fetching order table:", error);
  }
};

export const productByName = async (query) => {
  try {
    const Query = `%${query}%`
    const response = await axios.get(`${API_URL_COMMON}/getAllProductByName?phone_name=${Query}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
export const productByID = async (query) => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/getProduct?phone_name=${query}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};


export const fetchOfferByID = async (param) => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/offerDisplayByID/${param.id}`,
      {
        withCredentials: true
      }
    )
    return response.data;

  } catch (error) {
    console.log(error);

  }
}
export const headerOrder = async () => {
  try {
    const response = await axios.get(`${API_URL_Admin}/headerOrder`, {
      withCredentials: true
    })
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
}
export const productDiscout = async () => {
  try {
    const response = await axios.get(`${API_URL_COMMON}/offerDisplay`, {
      withCredentials: true
    })
    console.log(response);
    return response.data;

  } catch (error) {
    console.error("Error fetching product ", error);

  }
}


export const removeOffer = async ({ deleteid }) => {
  try {
    console.log("Deleting offer with ID:", deleteid);

    const response = await axios.delete(`${API_URL_Admin}/offerDelete/${deleteid}`, {
      withCredentials: true,
    });

    return response.data; // Explicitly return response data for clarity
  } catch (error) {
    console.error("Error removing offer:", error.message);

    // Optionally throw the error to let the caller handle it
    throw new Error(`Failed to remove offer: ${error.response?.data?.message || error.message}`);
  }
};

export const searchPromotion = async ({ promo_name }) => {
  if (!promo_name || promo_name.trim() === "") {
    console.error("Promo name is required for the search.");
    return { error: "Promo name is required." }; // Return an error response
  }

  try {
    const response = await axios.get(`${API_URL_COMMON}/offerDisplayByName?promo_name=${promo_name}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching promotion data:", error.message);

    // Return or rethrow error for the calling function to handle
    return { error: error.message || "An error occurred while searching for promotions." };
  }
};
export const insertPromotion = async ({ formData }) => {
  try {
    const payload = {
      phone_name: formData.phone_name,
      discount_percent: formData.discount_percent,
      start_date: formData.start_date,
      end_date: formData.end_date,
      promo_name: formData.promo_name,
      color: formData.Color,
      storage: formData.storage,
    };

    const response = await axios.put(`${API_URL_Admin}/offerInsert`, payload, {
      withCredentials: true,
      headers: {
        'Content-Type': "application/json"
      },
    });

    return response.data; // Assuming you need the response body

  } catch (error) {
    console.error("Error inserting promotion:", error);
    throw new Error(error.response?.data?.message || "Failed to insert promotion");
  }
};


export const updateProductVariants = async (formdata, id) => {
  const formData = new FormData();

  // Append all fields to FormData

  formData.append("stock", formdata.stock);
  formData.append("color", formdata.colors);

  // Append images to FormData
  for (let image of formdata.images) {
    formData.append("productImages", image); // Ensure "images" matches the backend field
  }
  try {
    const response = await axios.put(
      `${API_URL_Admin}/updateVariants/${id}`,
      formData, // Pass FormData directly
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // If authentication is required
      }
    );
    console.log("Update successful:", response.data); // Log success response
    return response.data; // Return the response data to the caller
  } catch (error) {
    console.error("Error updating product:", error);
    throw error; // Re-throw the error to allow proper error handling
  }
};
export const updateSpec = async (formdata, queryParam) => {
  try {
    const response = await axios.put(`${API_URL_Admin}/updateSpec?variantID=${queryParam.variantID}&oldStorage=${queryParam.oldStorage}`, formdata, {
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true
    })
    return response;

  } catch (error) {
    console.log(error);

  }
}
export const fetchOrderItemsByID = async (id) => {
  try {
    const response = await axios.get(`${API_URL_Admin}/tableOrderItemsByID/${id}`, {
      withCredentials: true
    })
    // console.log(id);

    return response.data;
  } catch (error) {
    console.log(error);

  }
}
// export const fetchOrderByID = async ({ id }) => {
//   try {
//     const response = await axios.get(`${API_URL_Admin}/orderByID/${id}`, {
//       withCredentials: true
//     })
//     // console.log(response.data);

//     return response.data;

//   } catch (error) {
//     console.log(error);

//   }
// }
export const deleteOrderItemByID = async ({ id }) => {
  try {
    const response = await axios.delete(`${API_URL_Admin}/deleteOrderItems/${id}`, { withCredentials: true })
    return response;
  } catch (error) {
    console.log(error);

  }
}
export const updateOrderItems = async ({ value }) => {
  try {
    const response = await axios.put(`${API_URL_Admin}/updateOrderItems`, value, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response;
  } catch (error) {
    console.log(error);

  }
}
