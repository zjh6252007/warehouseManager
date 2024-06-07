import jsPDF from "jspdf"
import QRCode from "qrcode";
import moment from "moment";

const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  };

  const generateQRCode = (text) => {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(text, { errorCorrectionLevel: 'H' }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
  };

const generateDeliveryOrder = async(orderInfo,companyInfo) =>{
const pdf= new jsPDF();
const { contact,  invoiceNumber, createdAt, salesperson, address, customer, total,totalTax,items,paymentType,installationFee,discount,note,subtotal,installation} = orderInfo;
const {address:storeAddress,phone,storeName,qrcode} = companyInfo;

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

    const imgData = await getBase64ImageFromURL('/google_review.png');
    const logo = await getBase64ImageFromURL('/wlAppliance.png');
    pdf.addImage(imgData, 'PNG', 100, 10, 25, 25); 
    pdf.addImage(logo,'PNG',0,0,15,15)

    if(qrcode !== null){
        const qrCodeData = await generateQRCode(qrcode);
        pdf.addImage(qrCodeData, 'PNG', 130, 10, 25, 25); // Adjust the position and size as needed
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
    pdf.text("Delivery To",20,55);
    pdf.setFontSize(12);
    pdf.text(`Name: ${customer||''}`,20,66);
    pdf.text(`Address: ${address||''}`,20,72);
    pdf.text(`Phone: ${contact||''}`,20,78);


    pdf.setFontSize(10);
    pdf.text(`Invoice:#${invoiceNumber}`,160,28);
    pdf.text(`Sales:${salesperson||''}`,160,32);
    pdf.text(`Order Date:${formattedDate}`,160,36);


    pdf.setFontSize(13);
    pdf.text("Model",18,90);
    pdf.text("Serial Number",55,90);
    pdf.text("Type",95,90);
    pdf.text(`Installation`,115,90);
    let datacolum = 100;

    pdf.setFontSize(9);
    if(installation === true){
      pdf.text(`Y`,123,100);
      }else{
        pdf.text(`N`,123,100);
      }


    items.forEach(item=>{
        pdf.text(item.model,18,datacolum);
        pdf.text(`${item.serialNumber||""}`,55,datacolum);
        pdf.text(item.type,95,datacolum);
        datacolum += 5;
    })

    pdf.text('By Signing below, customer acknowledge receipt of items mentioned above',18,datacolum += 30);
    pdf.text('Date: ____________________',18,datacolum += 10);
    pdf.text('Customer Signature: ____________________',76,datacolum);
    const pdfBlob = pdf.output('blob');
    window.open(URL.createObjectURL(pdfBlob), '_blank');

}

export {generateDeliveryOrder}