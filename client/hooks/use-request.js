import { useState } from 'react';
import axios from 'axios';

export default function useRequest({ method, url, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  const doRequest = async (additionalData = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...additionalData });
      console.log(response.data);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        setErrors(
          <div className='alert alert-danger' role='alert'>
            {err.response.data.errors.map((e) => (
              <p style={{ paddingBottom: 0, marginBottom: 0 }} key={e.message}>
                {e.message}
              </p>
            ))}
          </div>
        );
      } else {
        setErrors(
          <div className='alert alert-danger' role='alert'>
            {err.message}
          </div>
        );
      }
    }
  };
  return { doRequest, errors };
}
