import jsPDF from "jspdf"

const generateReceipt = (orderInfo,companyInfo) =>{
const pdf= new jsPDF();
const { contact,  invoiceNumber, createdAt, salesperson, address, customer, total,totalTax,items} = orderInfo;

const {address:storeAddress,phone,storeName} = companyInfo;
    const formattedDate = createdAt.split("T")[0];  

    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setTextColor(250); // Light gray for watermark
        pdf.setFontSize(60); // Large font size for visibility
        pdf.text(storeName|| " ", 30, pdf.internal.pageSize.height / 3, {
            angle: -45  // Diagonal angle
        });
    }

    pdf.setTextColor(70);
    pdf.setFontSize(16);
    pdf.text(storeName||" ",20,20);
    pdf.setFontSize(10);
    pdf.text(storeAddress||" ",20,30);
    pdf.text(phone||" ",20,35);

    pdf.setFontSize(16);
    pdf.text("RECEIPT", 165,20);
    pdf.setFontSize(10);
    pdf.text(`Invoice:#${invoiceNumber}`,165,28);
    pdf.text(`Sales:${salesperson||''}`,165,32);
    pdf.text(`Order Date:${formattedDate}`,165,36);
    pdf.setLineWidth(1)
    pdf.setDrawColor("#808080");
    pdf.line(0,40,250,40);

    pdf.text("BILL TO",20,55);
    pdf.setFontSize(10);
    pdf.text(`${customer}`,20,63);
    pdf.text(`${address}`,20,68);
    pdf.text(`${contact}`,20,73);

    pdf.setFontSize(13);
    pdf.text("Model",18,83);
    pdf.text("Serial Number",45,83);
    pdf.text("Type",85,83);
    pdf.text("Product Price",110,83);
    pdf.text("Warranty",145,83);
    pdf.text("Warranty Price",175,83);

    let datacolum = 90;

    pdf.setFontSize(9);
    items.forEach(item=>{
        pdf.text(item.model,18,datacolum);
        pdf.text(`${item.serialNumber||"N/A"}`,45,datacolum);
        pdf.text(item.type,85,datacolum);
        pdf.text(`$${item.price}`,110,datacolum);
        pdf.text(`${item.warranty} Years`,145,datacolum);
        pdf.text(`$${item.warrantyPrice}`,175,datacolum);
        datacolum += 5;
    })


    
    pdf.setFontSize(14);
    pdf.text(`Tax:$${totalTax.toFixed(2)}`,159.5,datacolum += 15);
    pdf.setFontSize(16);
    pdf.setTextColor("#1fd655")
    pdf.text(`Total: $${total.toFixed(2)}`, pdf.internal.pageSize.width - pdf.getStringUnitWidth("TOTAL") * 5 - 35, datacolum += 9 );


    const pdfBlob = pdf.output('blob');
    window.open(URL.createObjectURL(pdfBlob), '_blank');

}

export {generateReceipt}