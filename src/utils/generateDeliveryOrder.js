import jsPDF from "jspdf"

const generateDeliveryOrder = (orderInfo,companyInfo) =>{
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
    pdf.setLineWidth(1)
    pdf.setDrawColor("#808080");
    pdf.line(0,40,250,40);

    pdf.setFontSize(14);
    pdf.text("Customer Info",20,55);
    pdf.setFontSize(12);
    pdf.text(`Name: ${customer||''}`,20,66);
    pdf.text(`Address: ${address||''}`,20,72);
    pdf.text(`Phone: ${contact||''}`,20,78);


    pdf.setFontSize(13);
    pdf.text("Model",18,90);
    pdf.text("Serial Number",45,90);
    pdf.text("Type",85,90);
    let datacolum = 100;

    pdf.setFontSize(9);
    items.forEach(item=>{
        pdf.text(item.model,18,datacolum);
        pdf.text(`${item.serialNumber||"N/A"}`,45,datacolum);
        pdf.text(item.type,85,datacolum);
        datacolum += 5;
    })


    const pdfBlob = pdf.output('blob');
    window.open(URL.createObjectURL(pdfBlob), '_blank');

}

export {generateDeliveryOrder}