import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { getAllInventory, getInventory, getInventoryById, uploadInventoryFile, addInventory, deleteInventory } from '../redux/modules/inventory';
import { getStore } from '../redux/modules/myStore';
import { useEffect, useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import InventoryToolbar from '../components/InventoryToolBar';
import { generatePriceTag } from '../utils/generatePriceTag';
import InventoryForm from '../components/InventoryForm';
import Papa from 'papaparse';
import { message } from 'antd';

const Inventory = () => {
  const userInfo = useSelector(state => state.user.userInfo);
  const storeInfo = useSelector(state => state.myStore.storeList);
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const { storeId } = useParams();
  const [selectedRows, setSelectedRows] = useState([]);
  const [inventoryFormVisible, setInventoryFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);

  useEffect(() => {
    if (isStorePage) {
      dispatch(getInventoryById(storeId));
    } else if (userInfo.role === 'admin') {
      dispatch(getAllInventory());
      dispatch(getStore());
    } else {
      dispatch(getInventory());
    }
  }, [dispatch, userInfo.role, isStorePage, storeId]);

  const columns = [
    { field: 'itemDescription', headerName: 'Item Description', width: 250 },
    { 
      field: 'uploadDate', 
      headerName: 'Upload Date', 
      width: 200,
      renderCell: (params) => {
        if (!params.value) return '';
        return params.value.split('T')[0];
      }
    },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
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
    { field: 'category', headerName: 'Category', width: 160,hide:true},
    { field: 'subcategory', headerName: 'Subcategory', width: 220,hide:true},
    {
      field: 'unitRetail',
      headerName: 'Sale Price',
      width: 130,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    },
    {
      field: 'extRetail',
      headerName: 'Unit Retail',
      width: 130,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    },
    { field: 'product', headerName: 'Product', width: 150 },
    // 新增的 Location 列
    {
      field: 'location',
      headerName: 'Location',
      width: 300, // 根据需要调整宽度
    },
  ];

  // 为 admin 用户添加 cost 和 modify 列
  if (userInfo.role === 'admin') {
    columns.push({
      field: 'cost', 
      headerName: 'Cost', 
      width: 100,
      renderCell: (params) => (
        params.value !== null && params.value !== undefined && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
      )
    });
  
    columns.push({
      field: 'modify',
      headerName: 'Modify',
      width: 150,
      renderCell: (params) => (
        params.row.status !== 'sold' && isStorePage === true ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModify(params.row)}
          >
            Modify
          </Button>
        ) : null // 如果 status 是 'sold'，则不显示按钮
      ),
    });
  }

  const onCancel = () => {
    setInventoryFormVisible(false);
    setEditingInventory(null);
  };

  const onCreate = async (values) => {
    const isStoreChanged = editingInventory?.store?.id !== values.storeId; 
    const inventoryData = {
      ...values,
      store: { id: values.storeId } 
    };
  
    try {
      if (!isStoreChanged) {
        await dispatch(deleteInventory([editingInventory.id])); 
        await dispatch(addInventory(inventoryData));
      } else {
        try {
          await dispatch(addInventory(inventoryData));
          await dispatch(deleteInventory([editingInventory.id])); 
        } catch (error) {
          console.error('Failed to add inventory:', error);
          message.error('Failed to add inventory: SKU may already exist in the target store.');
          return;  
        }
      }
      message.success("Inventory successfully modified!");
      onCancel(); 
    } catch (error) {
      console.error('Failed to modify inventory:', error);
      message.error("Failed to modify inventory.");
    }
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

  const handleModify = (row) => {
    setEditingInventory(row); // 设置当前行数据到表单
    setInventoryFormVisible(true);
  };

  const inventoryData = useSelector(state => state.inventory.inventoryList);
  const processedInventoryData = inventoryData.map(item => ({
    ...item,
    id: item.id, // 确保每一行都有唯一的 id
    location: item.store?.address || 'N/A', // 如果没有地址，显示 'N/A' 或其他占位符
  }));
  const selectedData = inventoryData.filter(item => selectedRows.includes(item.id));
  const handleDownload = () => {
    const dataToExport = inventoryData.map(({ limitPercentage, qty, unitWeight, store, ...rest }) => ({
      ...rest,
      location: store?.address || 'N/A', // 确保导出的数据中也包含 location
    }));
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
      {userInfo.role === 'admin' && (<InventoryToolbar numSelected={selectedRows.length} onDelete={() => handleDelete()} />)}
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

        {userInfo.role === 'admin' && (
          <Button
            variant="contained"
            onClick={handleDownload}
            sx={{ ml: 2 }}
          >
            Download Inventory
          </Button>
        )}

        {isStorePage && (
          <Button
            variant="contained"
            sx={{ ml: 2 }}
            onClick={() => setInventoryFormVisible(true)}
          >
            Add Inventory
          </Button>
        )}
      </Box>
      {selectedRows.length > 0 && userInfo.role === 'admin' && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap:2, marginBottom: 2 }}>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Selected
          </Button>
        </Box> 
      )}

      {selectedRows.length > 0 &&(
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap:2, marginBottom: 2 }}>
                <Button variant="contained" color="success" onClick={()=>generatePriceTag(selectedData)}>
                  Print price tag
                </Button>
              </Box> 
      )}
      <DataGrid
        rows={processedInventoryData}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 18 },
          },
          sorting: {
            sortModel: [{ field: 'uploadDate', sort: 'desc' }],
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
        onCancel={onCancel}
        initialValues={editingInventory}  // 将 editingInventory 作为 initialValues 传递
        storeInfo={storeInfo}  // 传递 storeInfo 数据
      />
    </Box>
  );
};

export default Inventory;
