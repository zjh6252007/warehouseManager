// src/components/Inventory.jsx

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllInventory,
  getInventory,
  getInventoryById,
  uploadInventoryFile,
  addInventory,
  deleteInventory,
  getInventoryPagedAdmin,
  getInventoryPagedByStore
} from '../redux/modules/inventory';
import { getStore } from '../redux/modules/myStore';
import { useEffect, useState, useRef } from 'react';
import { Button, Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import InventoryToolbar from '../components/InventoryToolBar';
import { generatePriceTag } from '../utils/generatePriceTag';
import InventoryForm from '../components/InventoryForm';
import Papa from 'papaparse';
import { message, Spin } from 'antd';

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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(18);
  const [totalItems, setTotalItems] = useState(0);
  const pageSizeRef = useRef(18); // 使用 ref 来跟踪实际的 pageSize，防止被意外改变
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [sortModel, setSortModel] = useState([{ field: 'uploadDate', sort: 'desc' }]);
  const isInitialMount = useRef(true);
  const prevDebouncedSearchTextRef = useRef("");
  const prevPageRef = useRef(page);
  const prevSortModelRef = useRef(sortModel);

  // —— 移动端检测 —— 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 同步 pageSize 到 ref
  useEffect(() => {
    pageSizeRef.current = pageSize;
  }, [pageSize]);

  // 防抖处理搜索文本
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setPage(0); // 搜索时重置到第一页
    }, 1000); // 1000ms 延迟，减少闪烁

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const fetchData = async () => {
      // 判断是否是搜索触发的更新（debouncedSearchText 改变，但 page 和 sortModel 没变）
      const isSearchUpdate = prevDebouncedSearchTextRef.current !== debouncedSearchText && 
                             prevPageRef.current === page && 
                             JSON.stringify(prevSortModelRef.current) === JSON.stringify(sortModel);
      
      // 只在初始加载或非搜索操作（分页、排序）时显示 loading
      // 搜索时不显示 loading，避免闪烁
      if (isInitialMount.current || !isSearchUpdate) {
        setLoading(true);
      }
      
      // 更新引用
      prevDebouncedSearchTextRef.current = debouncedSearchText;
      prevPageRef.current = page;
      prevSortModelRef.current = sortModel;
      
      try {
        // 从 sortModel 中提取排序信息
        const sortField = sortModel.length > 0 ? sortModel[0].field : 'uploadDate';
        const sortDirection = sortModel.length > 0 ? sortModel[0].sort : 'desc';
        
        if (isStorePage) {
          const res = await dispatch(getInventoryPagedByStore(storeId, page, pageSize, debouncedSearchText, sortField, sortDirection));
          setTotalItems(res?.totalElements || 0);
        } else if (userInfo.role === 'admin') {
          const res = await dispatch(getInventoryPagedAdmin(page, pageSize, debouncedSearchText, sortField, sortDirection));
          setTotalItems(res?.totalElements || 0);
          await dispatch(getStore());
        } else {
          // For regular users, still use the old API for now
          await dispatch(getInventory());
        }
      } finally {
        setLoading(false);
        isInitialMount.current = false;
      }
    };
    fetchData();
  }, [dispatch, userInfo.role, isStorePage, storeId, page, pageSize, debouncedSearchText, sortModel]);

  const columns = [
    { field: 'itemDescription', headerName: 'Item Description', width: 250 },
    { 
      field: 'uploadDate', 
      headerName: 'Upload Date', 
      width: 200,
      renderCell: params => params.value ? params.value.split('T')[0] : ''
    },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: params => (
        <div style={{
          color: params.value === 'sold' ? 'red' :
                 params.value === 'inStock' ? 'green' :
                 'inherit',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          textAlign: 'center'
        }}>
          {params.value}
        </div>
      )
    },
    { field: 'soldDate', headerName: 'Sold Date', width: 150 },
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'category', headerName: 'Category', width: 160, hide: true },
    { field: 'subcategory', headerName: 'Subcategory', width: 220, hide: true },
    {
      field: 'unitRetail',
      headerName: 'Sale Price',
      width: 130,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    },
    {
      field: 'extRetail',
      headerName: 'Unit Retail',
      width: 130,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    },
    { field: 'product', headerName: 'Product', width: 150 },
    {
      field: 'location',
      headerName: 'Location',
      width: 300,
    },
  ];

  // Admin 额外两个列：Cost 和 Modify
  if (userInfo.role === 'admin') {
    columns.push({
      field: 'cost',
      headerName: 'Cost',
      width: 100,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    });

    columns.push({
      field: 'modify',
      headerName: 'Modify',
      width: 150,
      renderCell: params =>
        params.row.status !== 'sold' && isStorePage ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModify(params.row)}
          >
            Modify
          </Button>
        ) : null
    });
  }

  // 根据 isMobile 决定显示哪些列
  const displayedColumns = React.useMemo(() => {
    if (!isMobile) {
      return columns;
    }
    // 移动端只保留 model、status、product、cost
    return columns.filter(col =>
      ['model', 'status', 'product', 'cost'].includes(col.field)
    );
  }, [isMobile, columns]);

  const onCancel = () => {
    setInventoryFormVisible(false);
    setEditingInventory(null);
  };

  const onCreate = async values => {
    const isStoreChanged = editingInventory?.store?.id !== values.storeId;
    const inventoryData = { ...values, store: { id: values.storeId } };

    try {
      if (!isStoreChanged) {
        await dispatch(deleteInventory([editingInventory.id]));
        await dispatch(addInventory(inventoryData, page, pageSize, debouncedSearchText, userInfo, isStorePage));
      } else {
        try {
          await dispatch(addInventory(inventoryData, page, pageSize, debouncedSearchText, userInfo, isStorePage));
          await dispatch(deleteInventory([editingInventory.id]));
        } catch (error) {
          console.error('Failed to add inventory:', error);
          message.error('Failed to add inventory: SKU may already exist in the target store.');
          return;
        }
      }
      message.success('Inventory successfully modified!');
      onCancel();
    } catch (error) {
      console.error('Failed to modify inventory:', error);
      message.error('Failed to modify inventory.');
    }
  };

  const handleFileChange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const res = await dispatch(uploadInventoryFile(file, storeId, page, pageSize, debouncedSearchText));
    setLoading(false);

    if (res.code !== 0) {
      alert('File upload failed');
      console.error(res.message);
    }
  };

  const handleDelete = () => {
    dispatch(deleteInventory(selectedRows));
  };

  const handleModify = row => {
    setEditingInventory(row);
    setInventoryFormVisible(true);
  };

  const inventoryData = useSelector(state => state.inventory.inventoryList);
  const processedInventoryData = inventoryData.map(item => ({
    ...item,
    id: item.id,
    location: item.store?.address || 'N/A'
  }));

  const selectedData = inventoryData.filter(item => selectedRows.includes(item.id));

  const handleDownload = () => {
    const dataToExport = inventoryData.map(({ limitPercentage, qty, unitWeight, store, ...rest }) => ({
      ...rest,
      location: store?.address || 'N/A'
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
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 9999
          }}
        >
          <Spin tip="Loading..." size="large" />
        </Box>
      )}

      {!loading && (
        <>
          {userInfo.role === 'admin' && (
            <InventoryToolbar numSelected={selectedRows.length} onDelete={handleDelete} />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="Search by SKU, Model, Description, or Brand"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isStorePage && (
                <Button variant="contained" component="label" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Import Inventory'}
                  <input type="file" hidden accept=".csv" onChange={handleFileChange} />
                </Button>
              )}

              {userInfo.role === 'admin' && (
                <Button variant="contained" onClick={handleDownload}>
                  Download Inventory
                </Button>
              )}

              {isStorePage && (
                <Button variant="contained" onClick={() => setInventoryFormVisible(true)}>
                  Add Inventory
                </Button>
              )}
            </Box>
          </Box>

          {selectedRows.length > 0 && userInfo.role === 'admin' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete Selected
              </Button>
            </Box>
          )}

          {selectedRows.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
              <Button variant="contained" color="success" onClick={() => generatePriceTag(selectedData)}>
                Print price tag
              </Button>
            </Box>
          )}

          <DataGrid
            rows={processedInventoryData}
            columns={displayedColumns}
            paginationMode="server"
            sortingMode="server"
            rowCount={totalItems}
            paginationModel={{ page, pageSize }}
            pageSizeOptions={[10, 18, 25, 50]}
            onPaginationModelChange={(model) => {
              const newPageSize = model.pageSize;
              const newPage = model.page;
              
              // 如果 pageSize 改变了（且是用户主动改变的，在 pageSizeOptions 中）
              if (newPageSize !== pageSizeRef.current && [10, 18, 25, 50].includes(newPageSize)) {
                pageSizeRef.current = newPageSize;
                setPageSize(newPageSize);
                setPage(0); // 改变 pageSize 时重置到第一页
              } else if (newPageSize !== pageSizeRef.current) {
                // DataGrid 传递了错误的 pageSize（比如默认的 100），忽略它，只更新 page
                setPage(newPage);
                // 只有当当前 pageSize state 与 ref 不一致时才更新（避免不必要的渲染）
                if (pageSize !== pageSizeRef.current) {
                  setPageSize(pageSizeRef.current);
                }
              } else {
                // 只是翻页，pageSize 没变
                setPage(newPage);
              }
            }}
            onSortModelChange={(model) => {
              setSortModel(model);
              setPage(0); // 排序时重置到第一页
            }}
            sortModel={sortModel}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={newSelectionModel => {
              const selectedIDs = new Set(newSelectionModel);
              const filtered = inventoryData
                .filter(row => selectedIDs.has(row.id) && row.status !== 'sold')
                .map(row => row.id);
              setSelectedRows(filtered);
            }}
            isRowSelectable={params => params.row.status !== 'sold'}
            initialState={{
              sorting: { sortModel: [{ field: 'uploadDate', sort: 'desc' }] }
            }}
          />

          <InventoryForm
            visible={inventoryFormVisible}
            onCreate={onCreate}
            onCancel={onCancel}
            initialValues={editingInventory}
            storeInfo={storeInfo}
          />
        </>
      )}
    </Box>
  );
};

export default Inventory;
