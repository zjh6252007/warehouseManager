import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { getAllInventory,getInventory,getInventoryById,uploadInventoryFile } from '../redux/modules/inventory';
import { useEffect } from 'react';
import { Button ,Box} from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';

const columns = [
    { field: 'itemDescription',headerName:'Item Description',width:250},
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'brand', headerName: 'Brand',width:120},
    { field: 'model',headerName:'Model',width:130},
    { field: 'status',headerName:'status',width:130,
      renderCell:(params)=>(
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
    { field: 'soldDate',headerName:'Sold Date',width:150},
    { field: 'sku',headerName:'SKU',width:100},
    { field: 'category', headerName: 'Category', width: 160 },
    { field: 'subcategory',headerName: 'Subcategory',width:220},
    { field: 'unitRetail',headerName: 'Unit Retail',width:130,renderCell:(params)=>`$${params.value.toFixed(2)}`},
    { field: 'extRetail',headerName:'Ext Retail',width:130,renderCell:(params)=>`$${params.value.toFixed(2)}`},
    { field: 'product', headerName:'Product',width:150},
    { field: 'cost',headerName:'Cost',width:100,renderCell:(params)=>`$${params.value.toFixed(2)}`},
  ];
  
const Inventory = () =>
    {
      const userInfo = useSelector(state=>state.user.userInfo);
      const dispatch = useDispatch();
      const location = useLocation();
      const isStorePage = location.pathname.includes('/mystore');
      const {storeId} = useParams();
      
      useEffect(()=>{
        if(isStorePage)
          {
            dispatch(getInventoryById(storeId));
          }
        else if(userInfo.role === 'admin'){
        dispatch(getAllInventory())}
        else{
          dispatch(getInventory())
        };
      },[dispatch,userInfo.role,isStorePage,storeId])
      
      const handelFileChange=(event)=>{
        const file = event.target.files[0];
        if(file){
          dispatch(uploadInventoryFile(file,storeId));
        }
      }

      const inventoryData = useSelector(state=>state.inventory.inventoryList);
      console.log(inventoryData)
        return(
          <Box sx={{ width: '100%', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
          {isStorePage&&(
            <Button
              variant="contained"
              component="label"
            >
                Import Inventory
                <input
            type="file"
            hidden
            accept=".csv"
            onChange={handelFileChange}
          />
              </Button>
          )}
            </Box>
            <DataGrid
              rows={inventoryData}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 18 },
                },
              }}
              pageSize={18}
              checkboxSelection
            />
          </Box>
        );
    }

    export default Inventory;