import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import InputLabel from "@mui/material/InputLabel";

export default function EmailSent() {
  return (
    <Container component="main" maxWidth="xs" sx={{
        backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
        backgroundRepeat: 'no-repeat',
        backgroundColor: (t) =>
        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    }}>
    <CssBaseline />
    <Box
        sx={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: "1em",
        backgroundColor: "rgba(0,0,0,0)"
        }}
    >
        <Typography component="h1" variant="h4" sx={{alignSelf: "flex-start", mt: 2}}>
        Email Sent
        </Typography>
        <Link href="#/reset-password" //sx={{alignSelf: "stretch", margin: "auto"}}
        >
            <Box component="img"
                alt="Image of email being sent"
                src="https://cdn.pixabay.com/photo/2016/06/13/17/30/mail-1454731_960_720.png"
                sx={{width: '60%', marginLeft: "5em"
                // , alignSelf: "stretch", margin: "auto"
            }}
            />
        </Link>
        <Typography variant="body1" sx={{mb: 1, alignSelf: "flex-start"}}>
        We have sent you an email with instructions on how to reset your password
        </Typography>
        <Link href="#/login" variant="body2" sx={{alignSelf: "center", mb: 2}}>
            Back to Sign in
        </Link>
    </Box>
    </Container>
  );
}