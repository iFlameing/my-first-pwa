import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

class Profile extends Component {
  
  state = {
    image: null,
    supportsCamera: 'mediaDevices' in navigator
  }

  changeImage = (e) => {
    this.setState({
      image:URL.createObjectURL(e.target.files[0])
    })
  }

  startChangeImage = () => {
    this.setState({ enableCamera: !this.state.enableCamera})
  }

  takeImage = () => {
    this._canvas.width = this._video.videoWidth
    this._canvas.height = this._video.videoHeight
    this._canvas.getContext('2d').drawImage(
      this._video,
      0,0,
      this._video.videoWidth,
      this._video.videoHeight
    )
    this._video.srcObject.getVideoTracks().forEach(track => {
      track.stop()
    });

    this.setState({
      image: this._canvas.toDataURL(),
      enableCamera: false
    })
  }

  subscribe = () => {
    const key = "BC3CER1U3cdOr5Qau5QKJOM0n6IEpnr4ysG1G7E5rN12g9c-ydOnzIHg-AciSLwxCzfbpQhpPBmdyqiH52FzzjI"

    global.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key)
    }).then( sub => {
      console.log("Subscribed")
    }).catch(err => {
      console.log("Did not Subscribed")
    })
  }


  render(){
    return (
      <div>
        <nav className="navbar navbar-light bg-light">
          <span className="navbar-branc mb-0 h1">
            <Link to="/">
              <img src={Back} alt="logo" style={{height:30}} />
            </Link>
            Profile
          </span>
        </nav>
  
        <div style={{ textAligh: "center"}}>
          <img src={this.state.image || GreyProfile} alt="profile"
          style={{height:200, marginTop: 50}} />
          <p style={{color: '#888, fontSize:20'}}>username</p>

          {
            this.state.enableCamera && 
            <div>
              <video 
              ref={c => {
                this._video = c
                if(this._video) {
                  navigator.mediaDevices.getUserMedia({video: true})
                    .then(stream => this._video.srcObject = stream)
                }
              }}
              controls={false}
              autoPlay
              style={{width: '100%', maxWidth:300}}></video>

              <br />
              <button
              onClick={this.takeImage}
              >Take Image </button>

              <canvas 
              ref={c => this._canvas =c}
              style={{display: 'none'}} />
            </div>
          }
  
          <br />
          {
            this.state.supportsCamera && 
            <button
            onClick={this.startChangeImage}
            >
              Toggle Camera
            </button>
          }

          <br />
          <button onClick={this.subscribe}>Subscribe for Notifications</button>
        </div>
      </div>

    )

  }
}

class App extends Component {

  state = {
    items: [],
    loading: true,
    todoItem: '',
    offline: !navigator.onLine
  }

   componentDidMount() {
    fetch('http://localhost:4567/items.json').then(res => { console.log(res.clone().json()); return  res.clone().json()}).then(items => {
      console.log("thisis from the compopnent", items);
      this.setState({items, loading: false})
    })

    window.addEventListener('online', this.setOfflineStatus)
    window.addEventListener('offline', this.setOfflineStatus)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.setOfflineStatus)
    window.removeEventListener('offline', this.setOfflineStatus)
  }

  setOfflineStatus = () => {
    this.setState({ offline: !navigator.onLine})
  }

  addItem = (e) => {
    e.preventDefault()

    fetch('http://localhost:4567/items.json',{
      method: 'POST',
      body: JSON.stringify({item: this.state.todoItem}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.clone().json()).then(items => {
      if(items.error){
        alert(items.error)
      } else {
        this.setState({
          items,todoItem:''
        })
      }
    })

    this.setState({todoItem: ''})
  }

  deleteItem = (itemId) => {
    fetch('/items.json',{
      method: 'Delete',
      body:JSON.stringify({id:itemId}),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(items => {
      if(items.error){
        alert(items.error)
      } else {
        this.setState({ items})
      }
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar navbar-light bg-light">
          <span className="navbar-brand mb-0 h1">
            <img src={logo} className="App-logo" alt="logo" />
            Todo List
          </span>
          {
            this.state.offline && <span className= "badge badge-danger my-3">offline</span>
          }
        </nav>

        <div className="px-3 py-2">

          <form className="form-inline my-3" onSubmit={this.addItem}>
            <div className="form-group mb-2 p-0 pr-3 col-8 col-sm-10">
              <input 
              className="form-control col-12"
              placeholder="What do you need to do?"
              value={this.state.todoItem}
              onChange={e=> this.setState({
                todoItem:e.target.value
              })}
              />
            </div>
            <button
            type="submit"
            className="btn btn-primary mb-2 col-4 col-sm-2">
              Add
            </button>
          </form>
          {this.state.loading && <p>Loading...</p>}

          {
            !this.state.loading && this.state.items.length === 0 &&
            <div className="alert alert-secondary">
              NO-items -all done
            </div>
          }

          {
            !this.state.loading && this.state.items && 
            <table className="table table-striped">
              <tbody>
                {
                  this.state.items.map((item,i)=>{
                    return (
                      <tr key={item.id} className="row">
                        <td className="col-1">{i+1}</td>
                        <td className="col-10">{item.item}</td>
                        <td className="col-1">
                          <button
                          type="button"
                          className="close"
                          aria-label="Close"
                          onClick={() => this.deleteItem(item.id)}>
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          }
        </div>

      </div>
    )
  }

}

export default App;
