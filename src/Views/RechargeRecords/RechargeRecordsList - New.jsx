import * as XLSX from "xlsx";
import { Datagrid, DateField, List, NumberField, ReferenceField, TextField, ExportButton, TopToolbar, useListContext } from 'react-admin';
import {
  Typography,
  Box,
} from "@mui/material";
import { mapTransactionStatus } from '../../utils';
import { jsPDF } from "jspdf";
import "jspdf-autotable";


const objectSorter = GFG_Object =>
  ["transactionId","transactionDate","username","type","transactionAmount","status","remark","createdAt"]
    .reduce((finalObject, key) => {  
      finalObject[key] = GFG_Object[key];  
      return finalObject;  
    }, {}); 

const excelExporter = transactions => {
  const transactionsForExport = transactions.map(transaction => {
    const { objectId, userId, afterTransaction, ACL, gameId, redeemServiceFee, updatedAt, status, referralLink, beforeTransaction, ...transactionForExport } = transaction;
    transactionForExport.status = mapTransactionStatus(status);
    return transactionForExport;
  });
  console.log(objectSorter(transactionsForExport));
  const worksheet = XLSX.utils.json_to_sheet(objectSorter(transactionsForExport));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  const date = new Date().toLocaleDateString('es-CL');
  XLSX.writeFile(workbook, `Recharge Records ${date}.xlsx`, {compression: true});
};

const pdfExporter = transactions => {
  const transactionsForExport = transactions.map(transaction => {
      const { objectId, id, afterTransaction, ACL, gameId, redeemServiceFee, updatedAt, status, referralLink, beforeTransaction, ...transactionForExport } = transaction;
      transactionForExport.status = mapTransactionStatus(status);
      return transactionForExport;
    });
  const sortedTransactions = objectSorter(transactionsForExport);
  console.log(sortedTransactions);
  const doc = new jsPDF();
    doc.text("Recharge Records", 10, 10);
    doc.autoTable({
      head: [Object.keys(sortedTransactions)],
      body: Object.values(sortedTransactions),
    });
  const date = new Date().toLocaleDateString('es-CL');
  doc.save(`Recharge Records ${date}.pdf`);
}

const PostListActions = () => {
  const { data, isPending } = useListContext();
  const totalTransactionAmount = data && data
      // .filter((item) => item.status === 2 || item.status === 3)
      .reduce((sum, item) => sum + item.transactionAmount, 0);
  return <>
    <TopToolbar>
      <ExportButton exporter={excelExporter} maxResults={100000} label="Export as Excel"/>
      <ExportButton exporter={pdfExporter} maxResults={100000} label="Export as PDF"/>
    </TopToolbar>
    <Typography sx={{ mt: 2 }}>
      Total Recharged Amount: <b>${totalTransactionAmount}</b>
    </Typography>
  </>
};

export const RechargeRecordsList = () => (
    <List actions={<PostListActions />}>
        <Datagrid>
            <TextField source="id" />
            <DateField source="transactionDate" />
            <TextField source="type" />
            <TextField source="username" />
            <NumberField source="transactionAmount" />
            <TextField source="remark" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
            <TextField source="referralLink" />
            <NumberField source="status" />
        </Datagrid>
    </List>
);