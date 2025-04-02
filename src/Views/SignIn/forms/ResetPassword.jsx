import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import InputAdornment  from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';
import { useForm } from 'react-hook-form';
import { inputValidations } from '../validations';

export default function ResetPassword() {
    const {register, handleSubmit, getValues, formState: {errors}} = useForm();
    
    const onSubmit = (event) => {
      event.preventDefault();
      new FormData(event.currentTarget);
    };

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (evt) => evt.preventDefault();

  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (evt) => evt.preventDefault();

  return (
    <Container component="main" maxWidth="xs">
    <CssBaseline />
    <Box
        sx={{
        marginTop: 8,
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
        New Password
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3}}>
        <Grid container spacing={2}>
            <Grid item xs={12}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
                required
                fullWidth
                name="password"
                type={showPassword? 'text': 'password'}
                id="password"
                autoComplete="new-password"
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                {...register("password", inputValidations["password"])}
            />
            {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12}>
            <InputLabel htmlFor="password">Confirm Password</InputLabel>
            <OutlinedInput
                required
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword? 'text': 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label='toggle password visibility'
                            onClick={handleClickShowConfirmPassword}
                            onMouseDown={handleMouseDownConfirmPassword}
                            edge="end"
                        >
                            {showConfirmPassword? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                }
                {...register("confirmPassword", {validate: (value) => {
                    const {password} = getValues();
                    return password === value || "Confirm password should be the same as password";
                }})}
            />
            {errors.confirmPassword && <FormHelperText>{errors.confirmPassword.message}</FormHelperText>}
            </Grid>
        </Grid>
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            // href="#/login"
        >
            Reset password
        </Button>
        </Box>
    </Box>
    </Container>
  );
}