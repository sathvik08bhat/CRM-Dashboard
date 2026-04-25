const fs = require('fs');

const path = 'c:/Users/chala/Downloads/crm_updated/crm_updated/routes/invoices.js';
let content = fs.readFileSync(path, 'utf8');

const startStr = 'async function generateInvoicePDF(invoice, res, options = {}) {';
const startIndex = content.indexOf(startStr);

const endStr = 'doc.end();\n}';
let endIndex = content.indexOf(endStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    endIndex += endStr.length;
    
    const newFunc = `async function generateInvoicePDF(invoice, res, options = {}) {
    const template = options.template || 'image1';
    const snap = invoice.customerSnapshot || invoice.customer || {};
    const co = invoice.billingCompany || invoice.billingCompanySnapshot || {};
    const coName = co.name || process.env.COMPANY_NAME || 'Ken McCoy Consulting';
    const coSac = co.sacCode || '998516';
    const KMC_LOGO = require('path').join(__dirname, '..', 'public', 'images', 'logo-kmc.jpg');
    const fs2 = require('fs');
    
    // Formatting helpers
    const txt = (v) => (v == null ? '' : String(v));
    const fmt = (n) => { 
        const value = Number(String(n||0).replace(/,/g,'')); 
        return Number.isFinite(value) ? value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00'; 
    };
    const fmtDate = (d) => { 
        if(!d) return ''; 
        const dt=new Date(d); 
        if(Number.isNaN(dt.getTime())) return ''; 
        return require('moment-timezone')(dt).tz("Asia/Kolkata").format('DD-MM-YYYY'); 
    };

    const doc = new PDFDocument({ size:'A4', layout:'portrait', margin:0, autoFirstPage:true });
    const downloadVersion = Date.now();
    const filename = options.isSigned ? \`Invoice-\${invoice.invoiceNumber}-SIGNED-\${downloadVersion}.pdf\` : \`Invoice-\${invoice.invoiceNumber}-\${downloadVersion}.pdf\`;
    
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',\`attachment; filename="\${filename}"\`);
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('Expires','0');
    doc.pipe(res);

    const W=595.28, H=841.89, ML=35, MR=W-35, CW=MR-ML;
    const BLUE='#2b5a8e', ORANGE='#E65100', BLK='#000000', GRY='#555555', YEL='#f6e05e';
    let y=0;
    const T=(s,x,ty,o)=>{doc.text(s,x,ty,Object.assign({lineBreak:false},o||{}));};

    // ──────── HEADER ────────
    const hH=90;
    doc.rect(0, 0, W, hH).fill(BLUE);
    doc.fontSize(22).fillColor('white').font('Helvetica-Bold'); T('Ken McCoy Consulting', ML, 15);
    doc.fontSize(9).fillColor('white').font('Helvetica');
    T('B201, Hind Saurashtra Ind.Est, Marol,', ML, 42);
    T('Andheri - Kurla Road, Andheri (E), Mumbai 400059', ML, 54);
    T('Tel: 91 22 42959123, Mail: info@kenmccoy.in, Web: www.kenmccoy.in', ML, 66);
    
    try {
        if(fs2.existsSync(KMC_LOGO)) {
            doc.image(KMC_LOGO, MR-130, 8, {fit:[130, 42]});
            doc.fontSize(16).fillColor(YEL).font('Helvetica-Bold'); 
            T('TAX INVOICE', MR-130, 62, { width: 130, align: 'center' });
        } else {
            doc.fontSize(18).fillColor(YEL).font('Helvetica-Bold'); 
            T('TAX INVOICE', MR-150, 62);
        }
    } catch(e) {}
    y=hH;

    // ──────── CUSTOMER + METADATA ────────
    const sY=y+15; 
    const cW=315, mW=CW-cW; 
    const cX=ML, mX=ML+cW;
    const mRH=18, mTH=mRH*8;
    
    doc.rect(ML, sY, CW, mTH).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    doc.moveTo(mX, sY).lineTo(mX, sY+mTH).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    
    doc.rect(cX, sY, cW, mRH).fill(BLUE);
    doc.fontSize(9.5).fillColor('white').font('Helvetica-Bold'); 
    T('CUSTOMER', cX+10, sY+5);
    
    const cd=[['Cust Name:',txt(snap.name)],['Address:',txt(snap.address)],['Tel:',txt(snap.contactNo)],['Email:',txt(snap.email)]];
    let cf=sY+24;
    cd.forEach(([l,v])=>{
        doc.fontSize(8.5).fillColor(BLK).font('Helvetica-Bold'); T(l,cX+10,cf,{width:65});
        doc.font('Helvetica'); 
        doc.text(v, cX+80, cf, {width: cW-90, lineBreak: true});
        const th = doc.heightOfString(v, {width: cW-90, font: 'Helvetica', size: 8.5});
        cf += Math.max(16, th + 4); 
    });

    const md=[['INVOICE NO:',txt(invoice.invoiceNumber),false],['DATE:',fmtDate(invoice.invoiceDate),false],['CUSTOMER ID:',txt(snap.customerId),false],['DATE OF JOINING:',fmtDate((invoice.candidates||[])[0]?.dateOfJoining),false],['DUE DATE:',fmtDate(invoice.dueDate),true],['VENDOR CODE:',txt(snap.vendorCode||'NA'),false],['Dept Code:',txt(invoice.deptCode||'NA'),false],['Customer GSTN:',txt(snap.gstNo),false]];
    const mLW=Math.floor(mW*0.5); 
    let mf=sY;
    md.forEach(([l,v,o])=>{
        if (mf > sY) {
            doc.moveTo(mX, mf).lineTo(MR, mf).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        }
        doc.fontSize(8).fillColor(o?ORANGE:GRY).font('Helvetica-Bold'); T(l,mX+5,mf+5,{width:mLW-10,align:'right'});
        doc.moveTo(mX+mLW,mf).lineTo(mX+mLW,mf+mRH).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        doc.fontSize(8.5).fillColor(o?ORANGE:BLK).font('Helvetica-Bold'); T(v,mX+mLW+5,mf+5,{width:mW-mLW-10,align:'center'});
        mf+=mRH;
    });
    y=sY+mTH+15;

    // ──────── SERVICE TABLE ────────
    const sw=[26.28, 236.00, 105.00, 53.00, 105.00];
    const sx=[ML, ML+sw[0], ML+sw[0]+sw[1], ML+sw[0]+sw[1]+sw[2], ML+sw[0]+sw[1]+sw[2]+sw[3], ML+sw[0]+sw[1]+sw[2]+sw[3]+sw[4]];
    
    doc.rect(ML,y,CW,22).fill(BLUE);
    doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
    ['S.No.','Description of Service','Chargeable Salary','Rate','Chargeable Amt'].forEach((h,i)=>T(h,sx[i],y+6,{width:sw[i],align:'center'}));
    y+=22;
    
    const chgText = 'Sourcing, Recruiting and Onboarding Charges For: '+(invoice.chargesFor||'');
    const chgH = Math.max(18, doc.heightOfString(chgText, {width: sw[1]-10, font: 'Helvetica-Bold', size: 9}) + 10);
    doc.rect(ML,y,CW,chgH).fill('#4a7bb2');
    doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
    doc.text(chgText, sx[1]+5, y+5, {width: sw[1]-10});
    y+=chgH;
    
    const sTableTop=y-22-chgH; 
    let tableInnerTop = y;

    (invoice.candidates||[]).forEach((c,idx)=>{
        let rY = y;
        
        doc.fontSize(9.5).fillColor(BLK).font('Helvetica');
        T(String(idx + 1), sx[0], rY+8, {width:sw[0], align:'center'});
        
        doc.font('Helvetica-Bold'); T(txt(c.name), sx[1], rY+8, {width:sw[1], align:'center'});
        rY+=20;
        if(c.designation) {
            doc.font('Helvetica'); doc.text('Designation:', sx[1]+15, rY, {width:70, lineBreak: false});
            doc.font('Helvetica'); doc.text(txt(c.designation), sx[1]+85, rY, {width: sw[1]-90});
            rY += Math.max(16, doc.heightOfString(txt(c.designation), {width: sw[1]-90}) + 4);
        }
        if(c.level) {
            doc.font('Helvetica'); doc.text('Level:', sx[1]+15, rY, {width:70, lineBreak: false});
            doc.font('Helvetica'); doc.text(txt(c.level), sx[1]+85, rY, {width: sw[1]-90});
            rY += Math.max(16, doc.heightOfString(txt(c.level), {width: sw[1]-90}) + 4);
        }
        
        rY += 4; 
        
        let valY = y + ((rY-y)/2) - 6; 
        if(idx===0){
            doc.font('Helvetica-Bold');
            // USE Rs. instead of symbol to avoid '1' prefix encoding issue
            T('Rs. '+fmt(invoice.chargeableSalary),sx[2],valY,{width:sw[2]-10,align:'right'});
            T((invoice.rate||0).toFixed(2)+'%',sx[3],valY,{width:sw[3],align:'center'});
            T('Rs. ' + fmt(invoice.chargeableAmount), sx[4], valY, {width:sw[4]-10,align:'right'});
        }
        
        doc.dash(2, {space: 2});
        doc.moveTo(ML, rY).lineTo(MR, rY).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        doc.undash();
        
        y = rY;
    });
    
    const sTableBot=y; 
    doc.rect(ML,sTableTop,CW,sTableBot-sTableTop).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    
    doc.dash(2, {space: 2});
    sx.slice(1, -1).forEach(x=>{doc.moveTo(x,tableInnerTop).lineTo(x,sTableBot).strokeColor('#aaaaaa').lineWidth(0.5).stroke();});
    doc.undash();

    // ──────── GST & TOTAL SECTION ────────
    const gL = sx[3], gW = sw[3], gVL = sx[4], gVW = sw[4];
    
    const dR_T=(l,v,b)=>{
        doc.dash(2, {space: 2});
        doc.moveTo(gL,y).lineTo(MR,y).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        doc.moveTo(gVL,y).lineTo(gVL,y+20).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        doc.undash();
        
        doc.fontSize(8.5).fillColor(BLK).font(b?'Helvetica-Bold':'Helvetica'); 
        T(l,gL+2,y+5,{width:gW-4,align:'right'});
        
        doc.fontSize(9.5).fillColor(BLK).font(b?'Helvetica-Bold':'Helvetica'); 
        T('Rs. '+fmt(v),gVL,y+5,{width:gVW-10,align:'right'});
        y+=20;
    };
    
    const gstTop = y;
    if(invoice.cgst>0){ dR_T('CGST@9%',invoice.cgst,false); dR_T('SGST@9%',invoice.sgst,false); }
    else if(invoice.igst>0){ dR_T('IGST@18%',invoice.igst,false); }
    dR_T('Total GST',invoice.totalGst,true);
    dR_T('Total Amount',invoice.totalAmount,true);
    dR_T('Net Payable',invoice.netPayable,true);
    
    doc.moveTo(gL,y).lineTo(MR,y).strokeColor('#aaaaaa').lineWidth(0.5).stroke(); // bottom edge
    doc.moveTo(gL,gstTop).lineTo(gL,y).strokeColor('#aaaaaa').lineWidth(0.5).stroke(); // left edge
    doc.moveTo(MR,gstTop).lineTo(MR,y).strokeColor('#aaaaaa').lineWidth(0.5).stroke(); // right edge

    // ──────── AMT IN WORDS ────────
    y+=10; // reduced gap
    const ws=numberToWords(invoice.netPayable)+' Only';
    doc.fontSize(10).fillColor(BLK).font('Helvetica-Bold');
    const al='Amt In Words: ', af=al+ws;
    const ax=ML+(CW-doc.widthOfString(af))/2;
    T(al,ax,y); doc.fillColor(ORANGE); T(ws,ax+doc.widthOfString(al),y);
    y+=18;

    // ──────── BANK + SIGNATURE ────────
    const bW2=315, sW2=CW-bW2, bY=y, bR2=20;
    
    doc.rect(ML,bY,bW2,18).fill(BLUE);
    doc.fontSize(9.5).fillColor('white').font('Helvetica-Bold'); T('OUR BANK & OTHER DETAILS',ML,bY+4,{width:bW2,align:'center'});
    
    const sigX=ML+bW2;
    doc.rect(sigX,bY,sW2,18).fill(BLUE);
    doc.fontSize(9.5).fillColor('white').font('Helvetica-Bold'); T('AUTHORISED SIGNATURE',sigX,bY+4,{width:sW2,align:'center'});
    
    // INCREASED SPACE FOR SIGNATURE (Using wasted space at bottom)
    const sigBoxH = 150; 
    
    doc.rect(ML, bY, CW, sigBoxH).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    doc.moveTo(sigX, bY).lineTo(sigX, bY+sigBoxH).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    
    doc.fontSize(11).fillColor(BLUE).font('Helvetica-Bold'); T('For ' + coName, sigX, bY+28, {width:sW2, align:'center'});
    
    let sigRowsY=bY+18;
    const bkL_Col=170, bkR_Col=bW2-bkL_Col;
    const bD=[['PAN NUMBER:',txt(co.panNumber),'Account Name:',txt(co.accountName||coName)],
              ['GSTN:',txt(co.gstn),'Bank & Branch:',txt((co.bankName||'')+', '+(co.branchName||''))],
              ['SAC Code:',txt(coSac),'CA Number:',txt(co.caNumber)],
              ['IFSC Code:',txt(co.ifscCode),'IFS Code:',txt(co.ifscCode)]];
              
    bD.forEach(([l1,v1,l2,v2])=>{
        if(sigRowsY > bY+18) {
            doc.moveTo(ML, sigRowsY).lineTo(sigX, sigRowsY).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        }
        doc.fontSize(8).fillColor(GRY).font('Helvetica-Bold'); T(l1,ML+5,sigRowsY+6,{width:70});
        doc.fillColor(BLK).font('Helvetica'); T(v1,ML+75,sigRowsY+6,{width:bkL_Col-75});
        doc.moveTo(ML+bkL_Col,sigRowsY).lineTo(ML+bkL_Col,sigRowsY+bR2).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
        doc.fontSize(8).fillColor(GRY).font('Helvetica-Bold'); T(l2,ML+bkL_Col+5,sigRowsY+6,{width:70});
        doc.fillColor(BLK).font('Helvetica');
        const valFontSize = (v2.length > 25) ? 7 : 8.5;
        doc.fontSize(valFontSize).text(v2, ML+bkL_Col+75, sigRowsY+5, {width: bkR_Col-80, lineBreak: true, height: bR2-2});
        sigRowsY+=bR2;
    });
    
    const sO = (invoice.signatures && invoice.signatures.length > 0) ? invoice.signatures[invoice.signatures.length - 1] : null;
    const sigImg = (sO && sO.isSigned && sO.signatureImage) ? sO.signatureImage : null;
    const sealImg = (sO && sO.sealImage) ? sO.sealImage : options.settingsSealImage;
    
    if(sigImg) { 
        try { 
            const b6 = sigImg.replace(/^data:image\\/\\w+;base64,/,''); 
            doc.image(Buffer.from(b6,'base64'), sigX + (sW2-120)/2, bY+45, {width:120}); 
        } catch(e) {} 
    }
    if(sealImg) { 
        try { 
            const sb = (typeof sealImg === 'string' && sealImg.startsWith('data:image')) ? Buffer.from(sealImg.replace(/^data:image\\/\\w+;base64,/,''),'base64') : sealImg; 
            doc.image(sb, sigX + sW2 - 80, bY+55, {width:70}); 
        } catch(e) {} 
    }
    
    doc.fontSize(10).fillColor(BLK).font('Helvetica-Bold');
    T('Authorised Signatory.', sigX, bY+sigBoxH-15, {width:sW2, align:'center'});
    
    y = bY + sigBoxH;

    // ──────── TERMS & CONDITIONS ────────
    y += 10;
    const tcHdr=16, tcBody=70;
    doc.rect(ML,y,CW,tcHdr).fill(BLUE);
    doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
    T('TERMS & CONDITIONS',ML,y+4,{width:CW,align:'center'});
    doc.rect(ML,y+tcHdr,CW,tcBody).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
    doc.fontSize(8.5).fillColor(BLK).font('Helvetica');
    const tms=['1. Please comply with TDS provisions, if applicable.','2. All payments should be made in favour of "'+coName+'" only.','3. Interest @21% per annum will be charged beyond due date.','4. Payment once made shall not be refunded.','5. All disputes are within Mumbai jurisdiction only.'];
    tms.forEach((t,i)=>T(t,ML+15,y+tcHdr+7+(i*12)));

    // ──────── FOOTER ────────
    const footH=25, footY=H-footH;
    doc.rect(0,footY,W,footH).fill(ORANGE);
    doc.fontSize(7.5).fillColor('white').font('Helvetica-Bold');
    T('Thank you for giving us business! Any invoice / accounts related query please call our Accounts - +91 22 42959123', ML, footY+8, {width:CW-40});
    try{if(fs2.existsSync(KMC_LOGO))doc.image(KMC_LOGO,MR-95,footY+3,{fit:[95,footH-6]});}catch(e){}

    doc.end();
}`;

    const finalNewFunc = newFunc.replace(/\\\\w/g, '\\w');

    content = content.substring(0, startIndex) + finalNewFunc + content.substring(endIndex);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Successfully replaced the PDF Generation block!");
} else {
    console.log("Error: Start or End bounding box not found.");
}
