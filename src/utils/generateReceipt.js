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

  
const generateReceipt = async(orderInfo,companyInfo) =>{
const pdf= new jsPDF();
const { contact,  invoiceNumber, createdAt, salesperson, address, customer, total,totalTax,items,paymentType,installationFee,discount,note,subtotal} = orderInfo;
const {address:storeAddress,phone,storeName,qrcode,storeLogo,purchaseAgreement} = companyInfo;
const formattedDate = moment(createdAt).format('MM/DD/YYYY'); 
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
    console.log(storeLogo)
    if(storeLogo != 0){
    const logo = await getBase64ImageFromURL('/wlAppliance.png');
    pdf.addImage(imgData, 'PNG', 100, 10, 25, 25); 
    pdf.addImage(logo,'PNG',0,0,15,15)
    }
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

    pdf.setFontSize(16);
    pdf.text("RECEIPT", 160,20);
    pdf.setFontSize(10);
    pdf.text(`Invoice:#${invoiceNumber}`,160,28);
    pdf.text(`Sales:${salesperson||''}`,160,32);
    pdf.text(`Order Date:${formattedDate}`,160,36);
    pdf.setLineWidth(1)
    pdf.setDrawColor("#808080");
    pdf.line(0,40,250,40);

    pdf.text("BILL TO",20,55);
    pdf.setFontSize(10);
    pdf.text(`${customer||''}`,20,63);
    pdf.text(`${address||''}`,20,68);
    pdf.text(`${contact||''}`,20,73);

    pdf.text("Delivery Infomation",130,55);

    pdf.text(`Delivery Fee: $${items[0].deliveryFee||'0'}`,130,63)
    pdf.text(`Installation Fee: $${installationFee||'0'}`,130,68)
    pdf.setFontSize(13);
    pdf.text("Model",18,83);
    pdf.text("Serial Number",59,83);
    pdf.text("Type",105,83);
    pdf.text("Product Price",135,83);
    pdf.text("Warranty",175,83);

    let datacolum = 90;
    let totalWarrantyPrice = 0; 
    pdf.setFontSize(9);
    items.forEach(item=>{
        pdf.text(item.model,18,datacolum);
        pdf.text(item.sku || item.serial_number || 'N/A', 59, datacolum);
        pdf.text(item.type,105,datacolum);
        pdf.text(`$${item.price}`,145,datacolum);
        pdf.text(`${item.warranty} Years`,180,datacolum);
        totalWarrantyPrice += item.warrantyPrice;
        datacolum += 5;
    })

    datacolum += 15;
    pdf.setLineWidth(0.5)
    pdf.setDrawColor("#808080");
    pdf.line(10,datacolum,200,datacolum);
    pdf.text("NOTE",15,datacolum += 5);
    const noteLines = pdf.splitTextToSize(note||"",75);
    let currentLineY = datacolum + 4;
    for(const line of noteLines){
        pdf.text(line,14,currentLineY)
        currentLineY += 3;
    }
    
    datacolum -= 5;
    pdf.line(10,datacolum,10,datacolum+=45);
    datacolum -= 45;
    pdf.line(200,datacolum,200,datacolum+=45);
    datacolum -= 45;
    pdf.line(100,datacolum,100,datacolum+=45);
    datacolum -= 45;
    pdf.text("PAYMENT TYPE",109,datacolum += 5);
    datacolum -= 5;

    pdf.text(paymentType||"",113,datacolum += 10);

    datacolum -= 10;
    
    if(discount){
    pdf.text(`SUBTOTAL:$${(total-totalTax+discount).toFixed(2)}`,145,datacolum += 5);
    }else{
      pdf.text(`SUBTOTAL:$${(total-totalTax).toFixed(2)}`,145,datacolum += 5);
    }
    pdf.text(`Discount:$${discount||0}`,145,datacolum+= 7);
    pdf.text(`Warranty Price:$${totalWarrantyPrice}`,145,datacolum+= 7);
    pdf.text(`TAX:$${totalTax.toFixed(2)}`,145,datacolum += 7);
    pdf.text(`Total: $${total.toFixed(2)}`,145,datacolum += 10);
    datacolum -= 36;
    
    pdf.line(140,datacolum,140,datacolum+=45);
    pdf.line(10,datacolum,200,datacolum);
    pdf.setFontSize(14);
    
    pdf.setFontSize(8);
    pdf.setTextColor(70);

    datacolum += 30;
    const lines = pdf.splitTextToSize(purchaseAgreement || "", 180);
    for (let i = 0; i < lines.length; i++) {
      pdf.text(lines[i], 18, datacolum);
      datacolum += 5; // 每行间距 5
    }
    
    pdf.setFontSize(10);
    pdf.text("Customer Signature:_____________",145,datacolum += 15);
    
  
    const pdfBlob = pdf.output('blob');
    window.open(URL.createObjectURL(pdfBlob), '_blank');

}

export {generateReceipt}
