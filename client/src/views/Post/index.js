import React, { useState, useEffect } from 'react';
import { makeStyles, Grid, Paper, Button, InputBase } from '@material-ui/core';
import ReactMarkdown from 'react-markdown';
import SimpleMDE from 'react-simplemde-editor';
import { Remarkable } from 'remarkable';
import Arweave from 'arweave';

const arweave = Arweave.init();

const useStyles = makeStyles(theme => ({
  center: {
    paddingTop: '15vh'
  },
  pt: {
    padding: '5px 15px'
  },
  ch: {
    height: '100%'
  },
  sc: {
    overflow: 'auto'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  bt: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '45px'
  },
  lg: {
    border: '1px solid #3f51b5',
    padding: '2px',
    color: '#3f51b5',
    fontWeight: '500',
    borderRadius: '5px'
  }
}));

export default function Post() {
  const classes = useStyles();
  const [handleChange, setHandleChange] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const loggin = async () => {
      let wallet = JSON.parse(localStorage.getItem('wallet'));
      if (wallet) {
        setWallet(wallet);
        setLoggedIn(true);
      }
    };
    loggin();
  }, []);

  const signIn = async event => {
    var fr = new FileReader();
    fr.onload = e => {
      try {
        const wallet = JSON.parse(e.target.result);
        setWallet(wallet);
        setLoggedIn(true);
        arweave.wallets.jwkToAddress(wallet).then(async address => {
          localStorage.setItem('address', JSON.stringify(address));
          localStorage.setItem('wallet', JSON.stringify(wallet));
        });
      } catch (e) {
        console.log(e);
      }
    };
    fr.readAsText(event.target.files[0]);
  };

  const logout = async () => {
    localStorage.removeItem('address');
    localStorage.removeItem('wallet');
    setLoggedIn(false);
  };

  const generateHTML = async () => {
    let md = new Remarkable();
    let html =
      '<html><head><title>' +
      title +
      '</title><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous"><head><body><div style="margin-top: 30px;" class="container">' +
      md.render(handleChange) +
      '</div><script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script><script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script><script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script></body></html>';
    try {
      (async () => {
        console.log(wallet);
        let trans = await arweave.createTransaction(
          {
            data: html
          },
          wallet
        );
        trans.addTag('Content-Type', 'text/html');
        trans.addTag('blog', 'Blogeave');
        trans.addTag('title', title.toString());
        await arweave.transactions.sign(trans, wallet);
        await arweave.transactions.post(trans);
        setUrl(trans.id);
      })();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={`${classes.center} ${classes.ch}`}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.bt} elevation={3}>
            <InputBase
              className={classes.input}
              placeholder='Your Title :'
              inputProps={{ 'aria-label': 'title' }}
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={`${classes.ch} ${classes.sc}`} elevation={3}>
            <SimpleMDE onChange={setHandleChange} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper className={`${classes.ch} ${classes.sc}`} elevation={3}>
            <div className={classes.pt}>
              <ReactMarkdown source={handleChange} />
            </div>
          </Paper>
        </Grid>
        <Grid item xs={3}>
          {!loggedIn ? (
            <label htmlFor='login' className={`${classes.lg}`}>
              Sign In to upload
            </label>
          ) : (
            <div>
              <Button variant='outlined' color='primary' onClick={() => generateHTML()}>
                Upload to Arweave
              </Button>
              <Button variant='outlined' color='secondary' onClick={() => logout()}>
                Logout
              </Button>
            </div>
          )}
          <input
            id='login'
            type='file'
            style={{ display: 'none' }}
            onChange={event => signIn(event)}
          />
        </Grid>

        <Grid item xs={12}>
          {url ? (
            <a
              href={`https://arweave.net/${url}`}
              target='_blank'
              rel='noopener noreferrer'
            >{`https://arweave.net/${url}`}</a>
          ) : (
            <></>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
