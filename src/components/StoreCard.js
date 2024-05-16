import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export default function StoreCard({storeAddress,onClick}) {
  return (
    <Card sx={{ maxWidth: 345, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="160"
          image={`/store_logo.png?${new Date().getTime()}`} 
          alt="store logo"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {storeAddress}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}