const { default: SummaryApi } = require("../common")

const fetchCategoryWiseProduct = async(category)=>{
    const response = await fetch(SummaryApi.categoryWiseProduct.url,{
        method : SummaryApi.categoryWiseProduct.method,
        headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        body : JSON.stringify({
            category : category
        })
    })

    const dataResponse = await response.json()

    return dataResponse
}

export default fetchCategoryWiseProduct