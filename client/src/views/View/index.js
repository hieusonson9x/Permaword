import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { makeStyles, Paper, InputBase, IconButton, Grid } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import PostCard from 'components/PostCard';
import Arweave from 'arweave';

const arweave = Arweave.init();

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: '15vh',
    flexGrow: 1
  },
  pt: {
    padding: '5px 15px'
  },

  bt: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '99%'
  },
  mgb: {
    marginBottom: '30px'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

export default function View() {
  const classes = useStyles();
  const [address, setAddress] = useState(null);
  const [search, setSearch] = useState('');
  const [datas, setDatas] = useState([]);

  useEffect(() => {
    const getData = async () => {
      let address = JSON.parse(localStorage.getItem('address'));
      if (address) {
        setAddress(address);
        try {
          const txids = await arweave.arql({
            op: 'and',
            expr1: { op: 'equals', expr1: 'blog', expr2: 'Blogeave' },
            expr2: {
              op: 'equals',
              expr1: 'from',
              expr2: address
            }
          });
          console.log('tx', txids);
          setDatas(txids);
        } catch (error) {
          // If no you have recorded
          console.log(error);
        }
      }
    };
    getData();
  }, []);

  const searchTx = async () => {
    if (!search) {
      try {
        const txids = await arweave.arql({
          op: 'and',
          expr1: { op: 'equals', expr1: 'blog', expr2: 'Blogeave' },
          expr2: {
            op: 'equals',
            expr1: 'from',
            expr2: address
          }
        });
        console.log('tx', txids);
        setDatas(txids);
      } catch (error) {
        // If no you have recorded
        console.log(error);
      }
    } else {
      try {
        // const txids = await arweave.arql({
        //   op: 'and',
        //   expr1: { op: 'equals', expr1: 'from', expr2: address },
        //   expr2: {
        //     op: 'and',
        //     expr1: {
        //       op: 'equals',
        //       expr1: 'blog',
        //       expr2: 'Blogeave'
        //     },
        //     expr2: {
        //       op: 'equals',
        //       expr1: 'title',
        //       expr2: search.toString()
        //     }
        //   }
        // });
        const txids = await arweave.arql({
          op: 'and',
          expr1: { op: 'equals', expr1: 'title', expr2: search.toString() },
          expr2: {
            op: 'equals',
            expr1: 'from',
            expr2: address
          }
        });
        setDatas(txids);
      } catch (error) {
        // If no you have recorded
        console.log(error);
      }
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={`${classes.bt} ${classes.mgb}`} elevation={3}>
        <InputBase
          className={classes.input}
          placeholder='Search by title'
          inputProps={{ 'aria-label': 'search blog url' }}
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <IconButton className={classes.iconButton} aria-label='search' onClick={() => searchTx()}>
          <SearchIcon />
        </IconButton>
      </Paper>
      {address ? (
        <Grid container spacing={3}>
          {datas.map((data, index) => (
            <Grid key={index} item xs={12}>
              <PostCard data={data} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <h2>You need login first !</h2>
      )}
    </div>
  );
}
