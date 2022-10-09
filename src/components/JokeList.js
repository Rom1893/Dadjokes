import React, { Component } from 'react'
import axios from 'axios';
import "../css/JokeList.css"
import Joke from './Joke';
import { v4 as uuidv4 } from 'uuid';


class JokeList extends Component {

    static defaultProps = {
        numJokesToGet: 10
    };

    state = {
        loading: false,
        jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]")
    }

    seenJokes = new Set(this.state.jokes.map(m => m.joke))
    

    componentDidMount() {
        if(this.state.jokes.length === 0){
            this.getJokes();
        }
    }

     getJokes = async () => {   
        try{
        let jokesArray = [];
        while (jokesArray.length < this.props.numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com/",
                { headers: { Accept: "application/json" } })
                if(!this.seenJokes.has(res.data.joke)){
            jokesArray.push({joke: res.data.joke, votes: 0, id: uuidv4()})
        } else {
            console.log("Found Duplicate", res.data.joke)
        }
        }
        this.setState(st =>({
            loading: false,
            jokes: [...st.jokes, ...jokesArray]
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    } catch(e){
        alert(e)
        this.setState({loading: false})
    }
    }

    handleVote = (id, delta) =>{
        this.setState(st =>({
            jokes: st.jokes.map(m => m.id === id ? {...m, votes: m.votes + delta} : m)
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        )
    }

    buttonJokes = () => {
        this.setState({loading: true}, this.getJokes)
    }


    render() {

        if(this.state.loading) {
           return( 
           <div className='JokeList-spinner'>
                <i className='far fa-8x fa-laugh fa-spin'></i>
                <h1 className="JokeList-title">Loading</h1>
            </div>
            )
        }

        let jokeSort = this.state.jokes.sort((a,b) => b.votes - a.votes)
        return (
            <div className="JokeList">
            <div className="JokeList-sidebar">
            <h1 className='JokeList-title'><span>Best</span> jokes!</h1>
            <img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'/>
            <button onClick={this.buttonJokes} className='JokeList-getmore'>New Jokes</button>
            </div>
                
                <div className="JokeList-jokes">
                {jokeSort.map(m =>(
                    <Joke 
                    upvote={() => this.handleVote(m.id, 1) } 
                    downvote={() => this.handleVote(m.id, -1) }
                    key={m.id} 
                    text={m.joke} 
                    votes={m.votes}/>
                ))}
                </div>
            </div>
            
            
        )
    }
}

export default JokeList;
