import jsPDF from "jspdf"

const generatePriceTag = (selectedInventory) =>{
    const doc = new jsPDF();
    selectedInventory.forEach((item,index)=>{
        doc.setFontSize(24);
        doc.setTextColor(255,0,0);
        doc.text("WL APPLIANCES",20, 30 + index * 80);
    })

    doc.save("priceTag.pdf");
}
