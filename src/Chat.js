import React from "react";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';

const Chat = () => {

  return (
    <div>
      <Box sx={{
        height: "500px",
        border: "1px solid lightgrey"
      }}>

      </Box>
      <FormGroup row sx={{display: "flex"}}>
        <TextField fullWidth label="Chat with SpindriftAI" variant="outlined" />
        <Button variant="contained">Submit</Button>
      </FormGroup>
    </div>
  )

}

export default Chat;