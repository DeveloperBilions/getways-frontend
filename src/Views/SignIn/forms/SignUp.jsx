import * as React from 'react';
import { useCreate } from 'react-admin';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
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
import Parse from "parse";
import { parseConfig } from '../../../parseConfig';

Parse.initialize(parseConfig.APP_ID, parseConfig.JAVASCRIPT_KEY, parseConfig.MASTER_KEY);
Parse.serverURL = parseConfig.URL;


export default function SignUp() {
    
    const {register, handleSubmit, getValues, formState: {errors}} = useForm();
    
    const onSubmit = (data) => {
        // const [ create, { isPending, error } ] = useCreate('users', data);
        // create();
    const [ name, username, email, password] = [data.name, data.username, data.email, data.password];
    const user = new Parse.User;
    user.signUp({name: name, username: username, email: email, password: password}).then(user => console.log(user), error=> console.log(error.message));

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
        marginTop: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0.75,
        '& .MuiInputLabel-root': {textAlign: "left"},
        '& .MuiButton-root': {textTransform: "capitalize"},
        }}
    >
        {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <LockOutlinedIcon />
        </Avatar> */}
        <Typography component="h1" variant="h4">
        Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2}}>
        <Grid container spacing={1}>
            <Grid item xs={12} >
            <InputLabel htmlFor="name">Your Name</InputLabel>
            <OutlinedInput
                name="name"
                required
                fullWidth
                id="name"
                autoFocus
                // helperText="Required"
                {...register("name", inputValidations["name"])}
            />
            {errors.name && <FormHelperText>{errors.name.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12} >
            <InputLabel htmlFor="username">Username</InputLabel>
            <OutlinedInput
                name="username"
                required
                fullWidth
                id="username"
                autoFocus
                {...register("username", inputValidations["username"])}
            />
            {errors.username && <FormHelperText>{errors.username.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12}>
            <InputLabel htmlFor="email">Email</InputLabel>
            <OutlinedInput
                fullWidth
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...register("email", inputValidations["email"])}
            />
            {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
            </Grid>
            <Grid item xs={12}>
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
                required
                fullWidth
                name="password"
                // label="Password"
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
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <OutlinedInput
                required
                fullWidth
                name="confirmPassword"
                // label="Password"
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
            <Grid item xs={12}>
            <Typography variant="body2" sx={{textAlign: "left"}}>
            Upon registration, you will receive a confirmation email
            </Typography>
            </Grid>
        </Grid>
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 1 }}
            // href="#/login"
        >
            Sign Up
        </Button>
        <Grid container justifyContent="center" sx={{mb: 1}}>
            <Grid item>
            <Link href="#/login" variant="body2">
                Already have an account? Sign in
            </Link>
            </Grid>
        </Grid>
        </Box>
    </Box>
    </Container>
  );
}