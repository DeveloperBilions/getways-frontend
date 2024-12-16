import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from '@mui/material/FormHelperText';
import { useForm } from 'react-hook-form';
import { inputValidations } from '../validations';
 // console.log(inputValidations.email);

export default function PasswordResetEmail() {
  const {register, handleSubmit, formState: {errors}} = useForm();
    
  const onSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // console.log({
    //   email: data.get('email'),
    // });
  };


  return (
    <Container component="main" maxWidth="xs">
    <CssBaseline />
    <Box
        sx={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '& .MuiInputLabel-root': {textAlign: "left"},
        '& .MuiButton-root': {textTransform: "capitalize"},
        }}
    >
        {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
        </Avatar> */}
        <Typography component="h1" variant="h4">
        Forgot Password
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, alignSelf: "stretch"}}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
            <InputLabel htmlFor="email">Email</InputLabel>
            <OutlinedInput
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                {...register("email", inputValidations["email"])}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
            </Grid>
        </Grid>
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 5 }}
            // href="#/reset-email-sent"
        >
            Send Email
        </Button>
        <Grid container justifyContent="center">
            <Grid item>
            <Link href="#/login" variant="body2">
                Back to Sign in
            </Link>
            </Grid>
        </Grid>
        </Box>
    </Box>
    </Container>
  );
}