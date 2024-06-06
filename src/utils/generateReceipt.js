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
const {address:storeAddress,phone,storeName,qrcode} = companyInfo;
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
    if(items[0].deliveryDate){
        const deliveryDate = moment(items[0].deliveryDate).format('MM/DD/YYYY');
        pdf.text(`Delivery Date: ${deliveryDate}`,130,63);
        }else{
            pdf.text(`Delivery Date: N/A`,130,63);
        }
    const installationFees = installationFee || 0; 
    pdf.text(`Delivery Fee: $${items[0].deliveryFee||'0'}`,130,68)
    pdf.text(`Installation Fee: $${installationFee||'0'}`,130,73)
    pdf.setFontSize(13);
    pdf.text("Model",18,83);
    pdf.text("Serial Number",45,83);
    pdf.text("Type",85,83);
    pdf.text("Product Price",112,83);
    pdf.text("Warranty",145,83);
    pdf.text("Warranty Price",170,83);

    let datacolum = 90;

    pdf.setFontSize(9);
    items.forEach(item=>{
        pdf.text(item.model,18,datacolum);
        pdf.text(`${item.serialNumber||"N/A"}`,45,datacolum);
        pdf.text(item.type,82,datacolum);
        pdf.text(`$${item.price}`,115,datacolum);
        pdf.text(`${item.warranty} Years`,145,datacolum);
        pdf.text(`$${item.warrantyPrice}`,170,datacolum);
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

    pdf.text(`SUBTOTAL:$${subtotal.toFixed(2)}`,145,datacolum += 5);
    pdf.text(`Discount:$${discount||0}`,145,datacolum+= 7);
    pdf.text(`TAX:$${totalTax.toFixed(2)}`,145,datacolum += 7);
    pdf.text(`Total: $${total.toFixed(2)}`,145,datacolum += 10);
    datacolum -= 29;
    
    pdf.line(140,datacolum,140,datacolum+=45);
    pdf.line(10,datacolum,200,datacolum);
    pdf.setFontSize(14);
    
    pdf.setFontSize(8);
    pdf.setTextColor(70);
    pdf.text(`TYPE1: Scratch and Dent Goods: Warranty within 30 Days After Purchase:After 30 days: - Above delivery and service fees are not refundable. `,18,datacolum += 30)
    pdf.text('For reasons other than functional issues, customers are responsible for sending appliances back to the store by themselves. After the goods',18,datacolum += 5)
    pdf.text("are received, the payment will be refunded according to the customer's payment method (if customer need merchant pick up the returned",18,datacolum += 5)
    pdf.text("goods at home, additional shipping fees will be charged). Customers are responsible for any service fee / processing fee that may occur during",18,datacolum += 5)
    pdf.text("the refund. - Within the 30 days of purchase, please get in touch with the store if anything. When initialing a claim, please have the",18,datacolum += 5)
    pdf.text("following information ready:  ",18,datacolum+=5);
    pdf.text("1. Invoice/Receipt from the store as Proof of Purchase",18,datacolum += 5);
    pdf.text("2. Item Name and Model Number (Ex. LG Refrigerator, Model LRMVS3006)",18,datacolum+=5);
    pdf.text("Each service request is subject to a $99 deductible. And service includes parts, service, and labor.",18,datacolum+=5);
    pdf.text("99$ Fee charged only due to failure of accessories and not due to failure of product.",18,datacolum+=5)
    pdf.setFontSize(10);
    pdf.text("Customer Signature:_____________",145,datacolum += 15);
    
  
    const pdfBlob = pdf.output('blob');
    window.open(URL.createObjectURL(pdfBlob), '_blank');

}

export {generateReceipt}