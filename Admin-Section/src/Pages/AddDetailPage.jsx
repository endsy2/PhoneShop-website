import React from 'react'
import AddProductHeader from '../Section/Product/AddProductHeader'
import AddDetail from '../Section/Product/AddDetail'

const AddDetailPage = () => {
    return (
        <div className="mt-10">
            <section>
                <AddProductHeader
                    btn1="New brand"
                    btn2="New Category"
                    btn3="New Product"
                    btn4="New Detail"
                    route1="addBrand"
                    route2="addCategory"
                    route3="addProduct"
                    route4="addDetail"
                />
            </section>
            <section>
                <AddDetail />
            </section>
        </div>
    )
}

export default AddDetailPage
