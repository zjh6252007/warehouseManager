import { jsPDF } from "jspdf";

const generatePriceTag = (selectedInventory) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth * 0.9;

  const marginTop = 20;
  const marginBottom = 20;
  const spacing = 10; // 每个项目之间的间距
  let currentY = marginTop;

  selectedInventory.forEach((item) => {
    // 设置描述文字的行高为7（默认10）
    doc.setFontSize(12);
    const descriptionLines = doc.splitTextToSize(item.itemDescription, maxLineWidth);
    const descriptionLineHeight = 7; // 调整后的行高
    const descriptionHeight = descriptionLines.length * descriptionLineHeight;

    // 计算当前项目所需的总高度
    const itemHeight = 
      30 + // Header (WL APPLIANCES)
      12 + // Product name (之前是10)
      descriptionHeight + // Description
      14 + // Model#
      14 + // Was price
      30 + // Now price
      14 + // Save amount
      10 + // Warranty
      spacing; // 项目之间的间距

    // 检查当前页是否有足够的空间，否则添加新页
    if (currentY + itemHeight + marginBottom > pageHeight) {
      doc.addPage();
      currentY = marginTop;
    }

    // 开始绘制当前项目

    // Header
    doc.setFontSize(24);
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("WL", 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text("APPLIANCES", 35, currentY);

    // Product Name
    doc.setFontSize(20);
    const productTextWidth = doc.getTextWidth(item.product);
    doc.text(
      `${item.product}`,
      (pageWidth - productTextWidth) / 2,
      currentY + 12 // 调整后的y位置
    );

    // Description
    doc.setFontSize(12);
    descriptionLines.forEach((line, lineIndex) => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      const y = currentY + 22 + lineIndex * descriptionLineHeight; // 使用调整后的行高
      doc.text(line, x, y);
    });

    // 计算描述文字之后的y位置
    const afterDescriptionY = currentY + 22 + descriptionLines.length * descriptionLineHeight;

    // Model#
    doc.setFontSize(14);
    doc.setFont("times", "bolditalic");
    const modelText = `Model# ${item.model}`;
    const modelWidth = doc.getTextWidth(modelText);
    doc.text(
      modelText,
      (pageWidth - modelWidth) / 2,
      afterDescriptionY + 5 // 减少与描述之间的间距
    );

    // Was Price
    doc.setFont("courier", "normal");
    const wasPriceText = `Was $${item.extRetail}`;
    const wasPriceWidth = doc.getTextWidth(wasPriceText);
    doc.text(
      wasPriceText,
      (pageWidth - wasPriceWidth) / 2,
      afterDescriptionY + 15 // 相应调整y位置
    );

    // Now Price
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    const nowPriceText = `NOW $${item.unitRetail}`;
    const nowPriceWidth = doc.getTextWidth(nowPriceText);
    doc.text(
      nowPriceText,
      (pageWidth - nowPriceWidth) / 2,
      afterDescriptionY + 30 // y位置
    );

    // Save Amount
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    const saveAmount = `SAVE $${(item.extRetail - item.unitRetail).toFixed(2)} OFF`;
    
    const saveAmountWidth = doc.getTextWidth(saveAmount);
    doc.text(
      saveAmount,
      (pageWidth - saveAmountWidth) / 2,
      afterDescriptionY + 39 // y位置
    );

    // Warranty
    const warrantyText = "1 YEAR WARRANTY";
    const warrantyWidth = doc.getTextWidth(warrantyText);
    doc.text(
      warrantyText,
      (pageWidth - warrantyWidth) / 2,
      afterDescriptionY + 47 // y位置
    );

    // 更新currentY，为下一个项目做准备
    currentY = afterDescriptionY + 55 + spacing; // 根据需要调整
  });

  const pdfBlob = doc.output('blob');
  window.open(URL.createObjectURL(pdfBlob), '_blank');
};

export { generatePriceTag };
