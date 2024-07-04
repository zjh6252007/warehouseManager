import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { getAllInventory, getInventory, getInventoryById, uploadInventoryFile,addInventory} from '../redux/modules/inventory';
import { useEffect, useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import InventoryToolbar from '../components/InventoryToolBar';
import { deleteInventory } from '../redux/modules/inventory';
import InventoryForm from '../components/InventoryForm';
import Papa from 'papaparse';

const Inventory = () => {
  const userInfo = useSelector(state => state.user.userInfo);
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const { storeId } = useParams();
  const [selectedRows, setSelectedRows] = useState([]);
  const [inventoryFormVisible,setInventoryFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isStorePage) {
      dispatch(getInventoryById(storeId));
    } else if (userInfo.role === 'admin') {
      dispatch(getAllInventory());
    } else {
      dispatch(getInventory());
    }
  }, [dispatch, userInfo.role, isStorePage, storeId]);

  const columns = [
    { field: 'itemDescription', headerName: 'Item Description', width: 250 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 130 },
    {
      field: 'status', headerName: 'Status', width: 130,
      renderCell: (params) => (
        <div
          style={{
            color: params.value === 'sold' ? 'red' : params.value === 'inStock' ? 'green' : 'inherit',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {params.value}
        </div>
      )
    },
    { field: 'soldDate', headerName: 'Sold Date', width: 150 },
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'category', headerName: 'Category', width: 160 },
    { field: 'subcategory', headerName: 'Subcategory', width: 220 },
    {
      field: 'unitRetail', headerName: 'Unit Retail', width: 130,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    },
    {
      field: 'extRetail', headerName: 'Ext Retail', width: 130,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    },
    { field: 'product', headerName: 'Product', width: 150 }
  ];
  
  if (userInfo.role === 'admin') {
    columns.push({
      field: 'cost', headerName: 'Cost', width: 100,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    });
  }

  const onCreate = (values) => {
    const newInventory={
      ...values,
      store: { id: parseInt(storeId, 10) }
    };
    dispatch(addInventory(newInventory));
    console.log('Received values from form: ', newInventory);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const res = await dispatch(uploadInventoryFile(file, storeId));
      setLoading(false);
      if (res.code !== 0) {
        alert('File upload failed');
        console.log(res.message);
      }
    }
  };

  const handleDelete = () => {
    dispatch(deleteInventory(selectedRows));
  };

  const inventoryData = useSelector(state => state.inventory.inventoryList);

  const handleDownload = () => {
    const dataToExport = inventoryData.map(({ limitPercentage, qty,unitWeight,store, ...rest }) => rest);
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {userInfo.role === 'admin' &&(<InventoryToolbar numSelected={selectedRows.length} onDelete={()=>handleDelete()} />)}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
        {isStorePage && (
          <Button
            variant="contained"
            component="label"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import Inventory'}
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>

          
        )}
        
        <Button
          variant="contained"
          onClick={handleDownload}
          sx={{ ml: 2 }}
        >
          Download Inventory
        </Button>
        {isStorePage &&(
        <Button
          variant="contained"
          sx={{ ml: 2 }}
          onClick={()=>setInventoryFormVisible(true)}
        >
          Add Inventory
        </Button>
        )}
      </Box>
      {selectedRows.length > 0 && userInfo.role === 'admin' &&(
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Selected
          </Button>
        </Box>
      )}
      <DataGrid
        rows={inventoryData.map(item => ({ ...item, id: item.id }))}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 18 },
          },
        }}
        pageSize={18}
        pageSizeOptions={[5, 10, 18, 25]}
        checkboxSelection
        onRowSelectionModelChange={(newSelectionModel) => {
          const selectedIDs = new Set(newSelectionModel);
          const selectedItems = inventoryData.filter((row) =>
            selectedIDs.has(row.id) && row.status !== 'sold'
          ).map((row) => row.id);
          setSelectedRows(selectedItems);
        }}
        isRowSelectable={(params) => params.row.status !== 'sold'}
      />
        <InventoryForm
        visible={inventoryFormVisible}
        onCreate={onCreate}
        onCancel={() => setInventoryFormVisible(false)}
      />
    </Box>
  );
};

export default Inventory;