import { jsPDF } from "jspdf";

const generatePriceTag = (selectedInventory) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth * 0.9;

  // 每页最多两个项目
  const itemsPerPage = 2;
  let itemCount = 0;

  selectedInventory.forEach((item, index) => {
    if (itemCount === itemsPerPage) {
      // 添加新页面并重置 itemCount
      doc.addPage();
      itemCount = 0;
    }

    const yOffset = itemCount * 100; // 调整每个项目的位置

    doc.setFontSize(24);
    doc.setTextColor(255, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("WL", 20, 30 + yOffset);
    doc.setTextColor(0, 0, 0);
    doc.text("APPLIANCES", 35, 30 + yOffset);

    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    const textWidth = doc.getTextWidth(item.product);
    doc.text(`${item.product}`, pageWidth - (pageWidth + textWidth) / 2, 42 + yOffset);

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(item.itemDescription, maxLineWidth);
    lines.forEach((line, lineIndex) => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      const y = 52 + yOffset + lineIndex * 10;

      doc.text(line, x, y);
    });

    const modelWidth = doc.getTextWidth(`Model# ${item.model}`);
    doc.setFontSize(14);
    doc.setFont("times", "bolditalic");
    doc.text(`Model# ${item.model}`, pageWidth - (pageWidth + modelWidth) / 2, 62 + yOffset);

    doc.setFont("courier", "normal");
    doc.setFontSize(14);
    const extRetailWidth = doc.getTextWidth(`Was $${item.extRetail}`);
    doc.text(`Was $${item.extRetail}`, pageWidth - (pageWidth + extRetailWidth) / 2, 72 + yOffset);

    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    const unitRetailWidth = doc.getTextWidth(`Now $${item.unitRetail}`);
    doc.text(`NOW $${item.unitRetail}`, pageWidth - (pageWidth + unitRetailWidth) / 2, 85 + yOffset);

    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    const differenceWidth = doc.getTextWidth(`SAVE $${(item.extRetail - item.unitRetail)} OFF`);
    doc.text(`SAVE $${(item.extRetail - item.unitRetail)} OFF`, pageWidth - (pageWidth + differenceWidth) / 2, 94 + yOffset);

    const warrantyLength = doc.getTextWidth("1 YEAR WARRANTY");
    doc.text("1 YEAR WARRANTY", pageWidth - (pageWidth + warrantyLength) / 2, 102 + yOffset);

    itemCount++; // 增加项目计数器
  });

  const pdfBlob = doc.output('blob');
  window.open(URL.createObjectURL(pdfBlob), '_blank');
};

export { generatePriceTag };
