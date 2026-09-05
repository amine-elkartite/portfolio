import PDFDocument from 'pdfkit';

const money=value=>new Intl.NumberFormat('fr-MA',{style:'currency',currency:'MAD',minimumFractionDigits:2}).format(Number(value||0));
const date=value=>value?new Intl.DateTimeFormat('fr-FR').format(new Date(value)): '—';

export function createDocumentPdf(kind,document,client) {
  return new Promise((resolve,reject)=>{
    const pdf=new PDFDocument({size:'A4',margin:56,info:{Title:`${kind} ${document.number}`,Author:'Amine ELKARTITE'}});
    const chunks=[]; pdf.on('data',chunk=>chunks.push(chunk)); pdf.on('end',()=>resolve(Buffer.concat(chunks))); pdf.on('error',reject);
    const label=kind==='invoice'?'FACTURE':'DEVIS';
    pdf.fillColor('#0b1723').font('Helvetica-Bold').fontSize(24).text('AMINE ELKARTITE');
    pdf.fillColor('#1686ff').fontSize(10).text('DÉVELOPPEUR FULL-STACK');
    pdf.moveDown(3).fillColor('#0b1723').fontSize(22).text(label,{align:'right'});
    pdf.font('Helvetica').fontSize(11).fillColor('#516474').text(`N° ${document.number}`,{align:'right'}).text(`Émis le ${date(document.created_at)}`,{align:'right'});
    pdf.moveDown(2).fillColor('#0b1723').font('Helvetica-Bold').fontSize(12).text('CLIENT');
    pdf.font('Helvetica').fontSize(11).text(client?.name||'Client non renseigné').text(client?.company||'').text(client?.email||'').text(client?.phone||'');
    pdf.moveDown(2).font('Helvetica-Bold').fontSize(13).text(document.title);
    pdf.moveDown(.7).font('Helvetica').fontSize(10).fillColor('#516474').text(document.notes||'Prestation de développement web et services associés.',{lineGap:4});
    pdf.moveDown(2).fillColor('#0b1723').font('Helvetica-Bold').fontSize(11).text('Montant',{continued:true}).text(money(document.amount),{align:'right'});
    pdf.moveTo(56,pdf.y+14).lineTo(539,pdf.y+14).strokeColor('#dbe5ef').stroke();
    pdf.moveDown(2).font('Helvetica').fontSize(10).fillColor('#516474').text(kind==='invoice'?`Échéance : ${date(document.due_date)}`:`Valable jusqu’au : ${date(document.due_date)}`);
    pdf.moveDown(5).fontSize(9).text('Merci pour votre confiance. Pour toute question, contactez amineelkartite@gmail.com.',{align:'center'});
    pdf.end();
  });
}
