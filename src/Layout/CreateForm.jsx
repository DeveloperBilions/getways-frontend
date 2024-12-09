import * as React from "react";
import {Button} from "@mui/material";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import { Form, CreateBase } from "react-admin";

const onSubmit = (data) => {
    console.log(data);
};

export const CreateForm = ({title, handleClose, children}) => {
    return (
    <CreateBase>
    <Container component="overlay" maxWidth="sm" sx={{ p: 3, backgroundColor: "#fff", border: "1px solid black"}}>
    <Box
        className="overlayFormBox"
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiInputLabel-root': {
            textAlign: "left", 
            fontSize: "0.75em"
        },
        '& .MuiButton-root': {textTransform: "capitalize"},
        '& .MuiGrid-item':{
            display: "flex", 
            flexDirection: "row", 
            gap: 1, 
            alignItems: "center", 
            justifyContent: "flex-end"
        },
        '& .MuiTextField-root': {
            flexBasis: "75%",
            alignItems: "stretch",
        },
        }}
    >
        <Typography component="h1" variant="h6" sx={{mb: 3}}>
        {title}
        </Typography>
        <Form noValidate sx={{ mt: 3, alignSelf: "stretch"}} >
        <Grid container spacing={2}>
            {children}
            
        </Grid>
        <Grid container sx={{ mt: 5 , display: "flex", flexDirection: "row", gap: 1, justifyContent: "center"}}>
            <Button
                variant="outlined"
                onClick={handleClose}
            >
                cancel
            </Button>
            <Button
                type="submit"
                variant="contained"
                onClick={handleClose}
            >
                confirm
            </Button>
        </Grid>
        </Form>
    </Box>
    </Container>
    </CreateBase>
    );
};