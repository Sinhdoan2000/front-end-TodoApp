import './index.css';
import { useState, useEffect} from 'react';
import '@shopify/polaris/build/esm/styles.css';
import axios from 'axios';


function App() {

    const filters = [
        {
            name: "All"
        },
        {
            name: "Active"
        },
        {
            name: "Completed"
        }
    ];
  
    const [dataRender, setDataRender] = useState([]);
    const [rootData, setRootData] = useState([]);
    const [tabs, setTabs] = useState('All');
    const [isSearch, setSearch] = useState(false);
    const [addValue, setAddValue] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isShowing, setIsShowing] = useState(true);
  
/*  get Json từ API  */
    useEffect(function(){
        var todoApi = 'http://127.0.0.1:8000/api/todo';
    
        axios.get(todoApi)
            .then(function(res){
                const data = res.data;
                return data;
            })
            .then(function(data){
                setDataRender(data);
                setRootData(data);
            })

    }, []) 

/*  xử lý gửi dữ liệu đến API */
    async function postData(url = '', data = {}) {
        axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            },
        })
    };

/* xử lý cập nhập dữ liệu đến API */
    async function updateData(url = '', data = {}) {
        axios.patch(url, data, {
            headers: {
                'Content-Type': 'application/json'       
            },
        })
    };

/* Xử lý xoá item phía client */
    const handleDeleteFromClient= (id)=>{
        const currentRootItem = rootData.filter(function(item){
            return item.ID !== id;
        })
        const currentRenderItem = dataRender.filter(function(item){
            return item.ID !== id;
        })
        setRootData(currentRootItem);
        setDataRender(currentRenderItem);
    }

/* Xử lý xoá dữ liệu API */
    async function handleDeleteAPI(id){   
        var url = `http://127.0.0.1:8000/delete/${id}`;
        axios.delete(url)
        handleDeleteFromClient(id)
    }

/* Tạo 1 data mới */
    const handleCreateAPI = (id, status, title) => {
        let date = new Date();
    
            const newJob = {
                ID: id,
                STATUS: status,
                TITLE: title,
                created_at: date.toString(),
                updated_at: date.toString()       
            }
    
        postData('http://127.0.0.1:8000/api/todo', newJob)
        rootData.push(newJob);
    }

/* Xử lý thêm data. */
    const handleAdd = (e)=>{

        const isExist = rootData.filter(item=>{
            return addValue.toLocaleLowerCase() === item.TITLE.toLocaleLowerCase();
        })

        if(isExist.length <= 0 && addValue && e.keyCode === 13){
            let ID = rootData.length > 0 ? rootData[rootData.length - 1].ID + 1 : 0;
            
            handleCreateAPI(ID, 'false', addValue)        
            setRootData(rootData);
            setDataRender(rootData);
            setAddValue("");
        }

    }

/* Xử lý tìm kiếm data. */
    const handleSearch = (e) =>{

        setSearchValue(e.target.value);
        setTabs(filters[0].name);

        const resultFilter = rootData.filter(item=>{
            return item.TITLE.toLowerCase().search(e.target.value.toLowerCase()) !== -1; 
        }) 
        
        if(resultFilter && searchValue){
            setDataRender(resultFilter);
        }else if(searchValue.length === ""){
            setDataRender(rootData);
        }else{
            setDataRender([]);
        }

    }
 
  /* Xử lý lọc data khi change tabs. */
    const filterTabs = (tabs)=>{

        if(tabs === "All"){
            setDataRender(rootData);
        }else if(tabs === "Active"){
            const dataActives = rootData.filter(item => {
                return item.STATUS === "false";
            })

            setDataRender(dataActives);      
        }else{
            const dataCompleted = rootData.filter(item => {
                return item.STATUS === "true";
            })

            setDataRender(dataCompleted);
        }

    }
  
    useEffect(()=> {  
        filterTabs(tabs)
    }, [tabs])

/* khi tabs đang ở Active or completed: nếu checkbox thay đổi sẽ lọc lại data. */
    const filterData = (tabs) => {

        switch(tabs){
            case 'Active':
                    const dataActives = rootData.filter(item => {
                        return item.STATUS === "false";
                    })

                    setDataRender(dataActives);
                break;

            case 'Completed':
                    const dataCompleted = rootData.filter(item => {
                        return item.STATUS === "true";
                    })

                    setDataRender(dataCompleted);
                break;
        }

    }

    useEffect(() => {
        filterData(tabs)
    }, [isChecked])

/* xử lý cập nhập API */
    const handleUpdateAPI = (id, title, status)=>{

        const date = new Date();
        const currentDate = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours() + ':'+ date.getMinutes() + ':' + date.getSeconds();
        
        const updateJob = {
            TITLE: title,
            STATUS: status,
            updated_at: currentDate   
        }
        
        updateData(`http://127.0.0.1:8000/update/${id}`, updateJob, id)

    }

/* Xử lý khi change checkbox thì cập nhập data. */
    const handleIsChecked = (e, job) =>{   

        e.target.checked ? job.STATUS = "true" : job.STATUS = "false"; 

        rootData.forEach(item=>{
            if(item.ID === job.ID){
                e.target.checked ? item.STATUS = "true" : item.STATUS = "false";
            }
        })

        handleUpdateAPI(job.ID, job.TITLE, job.STATUS)
        setRootData(rootData)

    }
  
/* Bật input add */
    const handleRenderAll = ()=>{
        setSearch(false);
        setAddValue("");
        setDataRender(rootData);
        setTabs(filters[0].name);
    }

/* Bật input search */
    const handleOpenSearch  = () =>{
        setSearch(true);
        setSearchValue("");
        setDataRender(rootData);
        setTabs(filters[0].name);
    }

/* Xử lý thêm và thay đổi dữ liệu */
    const handleAddChange = (e) => {
        setAddValue(e.target.value);
        setDataRender(rootData);
        setTabs(filters[0].name);
    }

/* Xử lý thay đổi key */
    const handleChangeKey = () => {

        document.onkeyup = function (event) {

            switch(event.keyCode){
                case 27:
                        setIsShowing(false);
                    break;
                case 191:
                        setSearch(true);
                        setIsShowing(true);
                    break;
                default: 
                        setIsShowing(true);
                    break;
            }    
        };

    }

/* Thay đổi key bàn phím */
    useEffect(()=>{
        handleChangeKey()
    })


  return (
          <div className="App">

              <div className="Globo-app">

                  <header>
                      <h1 className="Globo-title">Things To Do</h1>
                      <div className="Globo-input" style={ isShowing ? {} : {display: "none"}}>
                          {!isSearch && <input type="text" 
                              id="Globo-input_add"
                              placeholder='Add New' 
                              value={addValue} 
                              onChange={e => handleAddChange(e)}
                              onKeyUp={e => handleAdd(e)}
                          />}
                          {isSearch && <input type="text" 
                              id="Globo-input_search" 
                              placeholder='Search' 
                              onChange={e => handleSearch(e)}
                          />}
                      </div>
                  </header>

                  <div className="Globo-content">
                      <ul className="Globo-listJobs">
                          {dataRender.length > 0 ? dataRender.map((job, index)=>{               
                              return (
                                  <li key={index} id={"Globo-job-" + job.ID} className="Globo-job_item" style={{display: "flex"}}>
                                      <input type="checkbox" 
                                        id={"Globo-checkbox-" + job.ID}
                                        className="Globo-checkboxJob" 
                                        checked={job.STATUS === "true" ? true : false}
                                        onChange={e => handleIsChecked(e, job)}
                                        onClick={() => setIsChecked(!isChecked)}
                                      />
                                      <label htmlFor={"Globo-checkbox-" + job.ID} className="Globo-job_name">{job.TITLE}</label>
                                      <button 
                                            type="button" 
                                            style={{ 
                                                marginLeft: 'auto', 
                                                border: 'none', 
                                                outline: 'none', 
                                                background: '#fff', 
                                                boxShadow: '0 0 10px rgba(0,0,0,0.5)', 
                                                borderRadius: '5px' 
                                            }}
                                            onClick={() => handleDeleteAPI(job.ID)}
                                        >x</button>
                                  </li>
                              )
                          }) :  <p style={{margin: "10px 0", padding: "10px", background: "#F2F2F2", color: "#888888", fontWeight: "500"}}>There are not items</p>}
                      </ul>
                  </div>

                  <footer style={{display: "flex"}}>
                      <div className="Globo-handle" style={{display: "flex"}}>
                          <button id="Globo-button-add" onClick={handleRenderAll}>
                              <i className="fa-solid fa-plus"></i>
                          </button>
                          <button id="Globo-button-search" style={{color: "#777"}} onClick={()=> handleOpenSearch()}>
                              <i className="fa-solid fa-magnifying-glass"></i>
                          </button>
                          <span className="Globo-countJob">{dataRender.length > 1 ? dataRender.length + " items left" : dataRender.length + " item left"}</span>
                      </div>
                      <div className='Globo-filters' style={{display: "flex"}}>
                          {filters.map((filter, index)=>{
                              return (
                                    <button 
                                        key={index}
                                        className={tabs === filter.name ? 'Globo-filters_button selected-'+ filter.name : 'Globo-filters_button' + filter.name}
                                        style={tabs === filter.name ? {border: "1px solid rgba(175, 47, 47, 0.2)"} : {}}
                                        onClick={()=> setTabs(filter.name)}
                                    >
                                        {filter.name}
                                    </button>
                              )
                          })}
                      </div>
                  </footer>

              </div>
              
              <p className="message-notify">
                  {isShowing ? 'Press `Esc` to cancel.' : 'Press `/` to search and `N` to create a new item.'}
              </p>

          </div>
  );
}

export default App;
