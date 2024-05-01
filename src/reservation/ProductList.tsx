import React from 'react';
import { Box } from '@mui/material';
import ProductListItem from './ProductListItem';

interface props {
  lists: Array<any>;
  extras: Array<any>;
  sx?: object;
}

const ProductList: React.FC<props> = ({ sx, extras, lists }) => {
  return (
    <Box sx={sx}>
      {lists && lists.length > 0 && lists.map((product: any) => {
        return (
          <ProductListItem key={product.id} extras={extras} product={product} />
        )
      })}
    </Box>
  );
}

export default ProductList;
