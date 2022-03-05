import { useState } from 'react';
import axios from 'axios';

export default function useRequest({ method, url, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      setErrors(null);
      const response = await axios[method](url, body);
      onSuccess && onSuccess(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
      setErrors(
        <div className='alert alert-danger' role='alert'>
          {err.response.data.errors.map((e) => (
            <p style={{ paddingBottom: 0, marginBottom: 0 }} key={e.message}>
              {e.message}
            </p>
          ))}
        </div>
      );
    }
  };
  return { doRequest, errors };
}
