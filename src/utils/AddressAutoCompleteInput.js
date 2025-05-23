// components/AddressAutoCompleteInput.jsx
import React, { useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from 'antd';

const AddressAutoCompleteInput = ({ value, onChange }) => {
  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place?.formatted_address) {
        onChange?.(place.formatted_address);
      }
    }
  };

  return (
    <Autocomplete
      onLoad={ref => (autocompleteRef.current = ref)}
      onPlaceChanged={handlePlaceChanged}
    >
      <Input
        value={value}
        placeholder="Enter address"
        onChange={e => onChange?.(e.target.value)}
      />
    </Autocomplete>
  );
};

export default AddressAutoCompleteInput;
