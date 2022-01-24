import React, { useState } from 'react';
import styled from 'styled-components';
import '../font.css'
import { ColumnDiv, firebaseUser, RowDiv, setFirebaseUser, setIgnoreStateChange } from '..';
import curPalette from '../Palette';
import { firebaseApp } from '../index'
import appSettings, { saveSettings } from '../Settings';
import { PackHelper } from '../Pack';
import { ButtonLabel } from '../Shared';
import TabButton from '../components/TabButton';
import { matchPath, useHistory, useRouteMatch } from 'react-router';
import RadioButton from '../components/RadioButton';

const { ipcRenderer } = window.require('electron');


const emailRegex = new RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
const strongRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*-./:])(?=.{8,})/);


const LoginContainer = styled.div`
    position: absolute;
    top: 25px;
    bottom: 0;
    width: 100%;
    display: flex;
    overflow: clip;
    background-color: ${curPalette.lightBackground};
    align-items: center;
    flex-direction: column;
`

const ErrorLabel = styled.label`
    color: red;
    font-family: Inconsolata;
`

const LoginInput = styled.input`
    height: 24px;
    padding: 4px;
    width: 50%;
    font-family: Inconsolata;
    border-radius: 4px;
    border: 2px solid ${curPalette.darkAccent};
    color: ${curPalette.text};
    background-color: ${curPalette.darkBackground};
    &::placeholder {
        color: ${curPalette.subText};
        -webkit-user-select: none;
    }
`

const LoginButton = styled.button`
    height:32px;
    width:128px;
    color:${curPalette.text};
    background-color:${curPalette.lightAccent};
    font-size:20px;
    border: none;
    font-family: Disket-Bold;
    -webkit-user-select: none;
    cursor: pointer;

    :hover {
        filter: brightness(85%);
    }
    :active {
        filter: brightness(75%);
    }
`



interface LoginProps {
    onSuccess: () => void;
}

function Login(props: LoginProps) {
    const [tab, setTab] = useState(1)
    const [page, setPage] = useState('main')
    const [emailValid, setEmailValid] = useState(true)
    const [passwordValid, setPasswordValid] = useState(true)
    const [password2Valid, setPassword2Valid] = useState(true)
    const [displayNameValid, setDisplayNameValid] = useState(true)
    const [displayNameValid2, setDisplayNameValid2] = useState(true)
    const [loginError, setLoginError] = useState('')

    const match = useRouteMatch('/')
    const history = useHistory()

    ipcRenderer.on('user-data-changed', () => {
        if (firebaseUser != null && match?.isExact) {
            history.push('/app')
        }
    })


    let email: string = appSettings.lastEmail
    let password: string = ''
    let password2: string = ''
    let displayName: string = ''
    let rememberMe: boolean = false;

    const validate = (): boolean => {
        let valid: boolean = true
        if (!email.match(emailRegex) && email !== '') {
            setEmailValid(false)
            valid = false
        } else {
            if (email === '') valid = false
            setEmailValid(true)
        }
        if (!password.match(strongRegex) && password !== '') {
            setPasswordValid(false)
            valid = false
        } else {
            if (password === '') valid = false
            setPasswordValid(true)
        }
        if (password !== password2 && password2 !== '') {
            setPassword2Valid(false)
            valid = false
        } else {
            if (password2 === '') valid = false
            setPassword2Valid(true)
        }

        return valid
    }

    const signUp = () => {

        if (!validate()) return;

        setIgnoreStateChange(true)
        firebaseApp.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                var user = userCredential.user;
                if (user != null) {
                    setFirebaseUser(user)
                    setPage('finish-setup')
                    //
                }
            })
            .catch((error) => {
                var errorCode = error.code;
                // ..
                console.log(errorCode)
                switch (errorCode) {
                    case 'auth/email-already-in-use': {
                        setLoginError('That email is in use!')
                        break
                    }
                    default: {
                        setLoginError(errorCode);
                    }
                }
            });

    }
    const signIn = () => {
        firebaseApp.auth().setPersistence(rememberMe ? 'local' : 'session').then(() => {
            firebaseApp.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
                var user = userCredential.user;
                if (user != null) {
                    setFirebaseUser(user)
                    appSettings.lastEmail = email
                    saveSettings()
                    props.onSuccess()
                }
            }).catch((error) => {
                var errorCode = error.code;
                // ..
                if (errorCode != null)
                    console.log(errorCode)
                else
                    console.log(error)

                switch (errorCode) {
                    case 'auth/user-disabled': {
                        setLoginError('That user has been disabled!')
                        break
                    }
                    case 'auth/user-not-found': {
                        setLoginError('No account has been registered with that email!')
                        break
                    }
                    case 'auth/wrong-password': {
                        setLoginError('Incorrect password or email!')
                        break
                    }
                    case 'auth/invalid-email': {
                        setLoginError('Invalid email!')
                        break
                    }
                    default: {
                        setLoginError(errorCode)
                    }
                }
            })
        })
    }

    const swapTab = (name: string) => {
        const tab = name === 'signin' ? 1 : 0
        if (tab !== tab) {
            setTab(tab)
            setEmailValid(true)
            setPasswordValid(true)
            setPassword2Valid(true)
            setLoginError('')
            email = ''
            password = ''
            password2 = ''
        }
    }

    const renderEmailField = () => {
        return (
            <ColumnDiv style={{ width: '100%', gap: 4 }}>
                {(emailValid === null || emailValid === false) && <ErrorLabel>Invalid email!</ErrorLabel>}
                <LoginInput type="email" onChange={(e) => {
                    let input = e.target as HTMLInputElement
                    email = input.value
                    validate()
                }} placeholder='Email' defaultValue={email} />
            </ColumnDiv>
        )
    }
    const renderDisplayNameField = () => {
        return (
            <ColumnDiv style={{ width: '100%', gap: 4 }}>
                {(displayNameValid === null || displayNameValid === false) && <ErrorLabel>Invalid display name! Must be between 3 and 15 characters!</ErrorLabel>}
                {(displayNameValid2 === null || displayNameValid2 === false) && <ErrorLabel>Name taken!</ErrorLabel>}

                <LoginInput type="email" onChange={async (e) => {
                    let input = e.target as HTMLInputElement
                    displayName = input.value;

                    if (displayName.length < 3 || displayName.length > 15)
                        setDisplayNameValid(false)
                    else
                        setDisplayNameValid(true)

                    const db = firebaseApp.database()
                    const ref = db.ref('users/')

                    let snapshot = await ref.get()
                    let users: { [key: string]: { displayName: string } } = snapshot.val()

                    const chosenName = PackHelper.displayNameToID(displayName)
                    for (let u in users) {
                        const userName = PackHelper.displayNameToID(users[u].displayName)
                        if (userName === chosenName) {
                            setDisplayNameValid2(false)
                            return;
                        }
                    }
                    setDisplayNameValid2(true)

                }} placeholder='Display Name' />
            </ColumnDiv>
        )
    }
    const renderPasswordField = (onSubmit?: () => void) => {
        return (
            <ColumnDiv style={{ width: '100%', gap: 4 }}>
                {(passwordValid === null || passwordValid === false) && <ErrorLabel>Password must contain 1 lowercase, 1 uppercase, 1 symbol, 1 number, and be at least 8 characters</ErrorLabel>}
                <LoginInput type="password" onChange={(e) => {
                    let input = e.target as HTMLInputElement
                    password = input.value
                    if (tab === 0)
                        validate()
                }} onKeyPress={(e) => {
                    if (e.key === 'Enter' && onSubmit != null) {
                        onSubmit()
                    }
                }} placeholder='Password' />
            </ColumnDiv>
        )
    }
    const renderPassword2Field = () => {
        return (
            <ColumnDiv style={{ width: '100%', gap: 4 }}>
                {(password2Valid === null || password2Valid === false) && <ErrorLabel>Passwords do not match!</ErrorLabel>}
                <LoginInput type="password" onChange={(e) => {
                    let input = e.target as HTMLInputElement
                    password2 = input.value
                    validate()
                }} placeholder='Re-enter password' />
            </ColumnDiv>
        )
    }

    const renderSignUp = () => {
        return (
            <ColumnDiv style={{ width: '50%', gap: 16, padding: 24 }}>
                {renderEmailField()}
                {renderPasswordField()}
                {renderPassword2Field()}
                {loginError != null && <ErrorLabel>{loginError}</ErrorLabel>}
                <LoginButton onClick={() => signUp()}>Register</LoginButton>
            </ColumnDiv>
        );
    }
    const renderSignIn = () => {
        return (
            <ColumnDiv style={{ width: '50%', gap: 16, padding: 24 }}>
                {renderEmailField()}
                {renderPasswordField(() => signIn())}
                {loginError != null && <ErrorLabel>{loginError}</ErrorLabel>}
                <LoginButton type="submit" onClick={() => signIn()}>Login</LoginButton>
                <RadioButton text='Remember me?' onChange={(v) => {
                    rememberMe = v;
                }} />
                <ButtonLabel style={{ fontStyle: 'italic' }} onClick={() => {
                    if (email !== '' && email.match(email)) {
                        firebaseApp.auth().sendPasswordResetEmail(email).then(() => {
                            alert(`Sent reset email to ${email}`)
                        }).catch((r) => {
                            console.log(r)
                        })
                    }
                }}>Forgot your password?</ButtonLabel>
            </ColumnDiv>
        );
    }
    const renderMain = () => {
        return (
            <ColumnDiv style={{ width: '100%' }}>
                <RowDiv style={{ backgroundColor: curPalette.darkBackground, width: '100%', height: '30px', justifyContent: 'center', gap: 36 }}>
                    <TabButton group="login-page" name="signin" defaultValue={true} onChange={(n: string) => swapTab(n)}>Sign In</TabButton>
                    <TabButton group="login-page" name="signup" onChange={(n: string) => swapTab(n)}>Sign Up</TabButton>
                </RowDiv>
                {tab === 0 && renderSignUp()}
                {tab === 1 && renderSignIn()}
            </ColumnDiv>
        )
    }
    const renderSetup = () => {
        return (
            <ColumnDiv style={{ padding: 24, width: '50%', gap: 8 }}>
                {renderDisplayNameField()}
                <RowDiv style={{ gap: 8 }}>
                    <LoginButton onClick={() => {
                        if (firebaseUser != null) {
                            firebaseApp.database().ref(`users/${firebaseUser.uid}`).remove()
                            firebaseUser.delete()
                        }
                        setPage('main')
                    }}>Cancel</LoginButton>
                    <LoginButton onClick={async () => {

                        if (displayName.length < 3 || displayName.length > 15) return;
                        if (firebaseUser === null) return;

                        firebaseApp.database().ref(`users/${firebaseUser.uid}`).set({ displayName: displayName, role: 'member', packs: [] })
                        appSettings.lastEmail = email
                        saveSettings()
                        props.onSuccess()

                    }}>Finish</LoginButton>
                </RowDiv>
            </ColumnDiv>
        )
    }

    return (
        <LoginContainer>
            {page === 'main' && renderMain()}
            {page === 'finish-setup' && renderSetup()}
        </LoginContainer>
    );
}

export default Login;
