new Vue({
      el: '#app',
      data() {
        return {
          logined: true,          
          activeIndex: 1,
          addContact: false,
          addNew: false,          
          language: 'cn',
          contactInfos: [],
          newsLists: [],
          historyLists: [],
          messageLists: [],
          contactInfosOrigin: [],
          newsListsOrigin: [],
          historyListsOrigin: [], 
          isModalShow: false,
          modalContent: '',
          modalStatus: '',
          isEditing: false,
          columns: [
            {content: '报告下载', icon: 'icon-copy', path: '#report'},           
            {content: '退出', icon: 'icon-shezhi', path: '#exit'}
          ],
          columnsContent: ['contact','news','history','message','exit'],
          cnKey: {
            tel: '电话',  fax: '传真', post: '邮编', address: '地址',contact: '联系', 
            year: '年份', date: '日期',title: '标题', detail: '内容', booth: '展位', image:'图片',
            event: '事件', title: '标题', name:'姓名', mail: '邮箱', phone: '电话', content: '内容'
          },
          newContact: { title: '',  tel: '', fax: '', post: '', contact: '', mail: '', address: '' },
          newNews: { year:'', date: '',title: '',detail: '',booth: '',image: ''},
          newHistory: {date: '',title: '',event: '',image: ''}          
        }
      },
      methods: {
        toEdit(){
          this.isEditing = true;
          this.addNew = false;
        },
        toAddNew(){
          this.addNew = !this.addNew;
          if(this.addNew){
            this.isEditing = false;
          }
        },
        loginSuccess () {
          this.logined = true;
          this.getLists('contact');
          this.activeIndex = 1;
        },
        checkLoginStatus () {
          if(!this.logined){
            this.logined = sessionStorage.getItem('benewarex')?true:false;
          }
          if(this.logined){
            this.getLists('contact');
          }
        },
        encodeFormData(data){
          if(!data){
            return "";
          }
          var pairs = [];
          for(var name in data){
            if(!data.hasOwnProperty(name)){
              continue;
            }
            if(typeof data[name] === 'function'){
              continue;
            }
            var value = data[name].toString();
            name = encodeURIComponent(name.replace('%20','+'));
            value = encodeURIComponent(value.replace('%20','+'));
            pairs.push(name + '=' + value);
          }
          return pairs.join('&');
        },
        postData (url, data, callback) {
          var request = new XMLHttpRequest();
          request.open('POST', url);
          request.onreadystatechange = function() {
            if(request.readyState===4 && callback){
              callback(request);
            }
          }
          request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          request.send(this.encodeFormData(data));
        },  
        /*获取列表信息： 各种*/      
        getLists (type) {          
          this.postData('./index.php/admin/getLists/'+type, {lang:this.language}, function(request){
            if (request && request.responseText) {              
              switch(type){
                case 'contact':
                  this.contactInfos = JSON.parse(request.responseText);
                  this.contactInfosOrigin = JSON.parse(request.responseText);
                  break;
                case 'news':
                  this.newsLists = JSON.parse(request.responseText);
                  this.newsListsOrigin = JSON.parse(request.responseText);
                  break;
                case 'history':
                  this.historyLists = JSON.parse(request.responseText);
                  this.historyListsOrigin = JSON.parse(request.responseText);
                  break;
                case 'message':
                  this.messageLists = JSON.parse(request.responseText); 
                  break;
                default:
                  return false;  
              }              
            }else{
              switch(type){
                case 'contact':
                  this.contactInfos = [];
                  this.contactInfosOrigin = [];
                  break;
                case 'news':
                  this.newsLists = [];
                  this.newsListsOrigin = [];
                  break;
                case 'history':
                  this.historyLists = [];
                  this.historyListsOrigin = [];
                  break;
                case 'message':
                  this.messageLists = [];                   
                  break;
                default:
                  return false;  
              }
            }
          }.bind(this))
        },        
        /*保存新的信息：各种 */
        saveNew(type){          
          var data = '';
          switch(type){
            case 'contact':
              data = this.newContact;
              break;
            case 'news':
              data = this.newNews;
              break;
            case 'history':
              data = this.newHistory;
              break;
            default:
              return false;      
          }
          /*需要判断新信息是否为空 */
          if(this.isDataEmpty(data)){
            this.showModal('error','数据不完整');
            return false;
          }         
          this.postData('./index.php/admin/addNewList/'+type,{lang:this.language, data: JSON.stringify(data)}, function(request){            
            if(request && request.responseText){
              result = JSON.parse(request.responseText);
              if (result['code']===0) {
                this.showModal('success','新增成功');
                this.addNew = false;
                switch(type){
                  case 'contact':                    
                    this.newContact =  { title: '',  tel: '', fax: '', post: '', contact: '', mail: '', address: '' };
                    break;
                  case 'news':                    
                    this.newNews = { date: '',title: '',detail: '',booth: '',image: ''};
                    break;
                  case 'history':                    
                    this.newHistory ={date: '',title: '',event: '',image: ''};
                    break;
                  default:
                    return false;      
                }
                this.getLists(type);               
              }else{
                this.showModal('error', '添加失败');
              }
            }else{
              this.showModal('error', '添加失败');
            }
          }.bind(this))
        },
        /*数据是否为空 */
        isDataEmpty(data){
          return data['title']?false:true;
        },
        /*数据是否更改过 */
        isDataSame(data1, data2){
          return JSON.stringify(data1)==JSON.stringify(data2);
        },
        findChangedData (changedData, originData) {
          var theChanged = [];
          for(var i=0; i<changedData.length; i++){
            if(!this.isDataSame(changedData[i], originData[i])){
              theChanged.push(changedData[i]);
            }
          }
          return theChanged;
        },
        showModal(status, content){
          this.isModalShow=true;
          this.modalContent = content;
          this.modalStatus = status;
          if(status!=='loading'){
            setTimeout(function(){
              this.isModalShow = false;
            }.bind(this),1500)
          }          
        },        
        /*保存修改过的所有信息：不考虑index */
        saveAll(index, type){
          this.showModal('loading','正在保存');          
          var data = '';
          switch(type){
            case 'contact':
              data = this.contactInfos;
              dataOrigin = this.contactInfosOrigin;
              break;
            case 'news':
              data = this.newsLists;
              dataOrigin = this.newsListsOrigin;
              break;
            case 'history':
              data = this.historyLists;
              dataOrigin = this.historyListsOrigin;
              break;
            default:
              return false;      
          }
          /*在提交数据之前把新旧数据进行一下对比，如果有变动则提交，如果没有变动，则不提交 */
          if(this.isDataSame(data, dataOrigin)){
            this.showModal('error','数据无变动');
            this.isEditing = false;
            return false;
          }else{
            /*如果有变动，则找出变动的信息 */
            var theChangedData = this.findChangedData(data,dataOrigin);
            this.postData('./index.php/admin/updateLists/'+type,{lang:this.language, data: JSON.stringify(theChangedData)}, function(request){            
              if (request && request.responseText ) {
                var result = JSON.parse(request.responseText);              
                if(result['code']==0 && result['tip']==theChangedData.length){
                  this.showModal('success','保存成功');
                  this.isEditing = false;
                  this.getLists(type);
                }
              }
            }.bind(this))
          }          
        }, 
        
        navbarClick (index) {
          this.isEditing = false;
          this.activeIndex = index + 1;
          /*点击退出后操作 */
          if( index==this.columns.length-1){
            this.logined = false; 
            localStorage.clear();
            sessionStorage.clear();
          }else{
            this.getLists(this.columnsContent[index]);
          }
        },

        setLang (lang) {          
          this.language = lang;
          this.getLists('contact');
          this.getLists('news');
          this.getLists('history');
        },
        
        changeNewContact(newVal, outerKey, outerIndex){          
          this.newContact[outerKey] = newVal;
        },
        changeNewNews(newVal, outerKey, outerIndex){          
          this.newNews[outerKey] = newVal;
        },
        changeNewHistory(newVal, outerKey, outerIndex){          
          this.newHistory[outerKey] = newVal;
        },

        changeContact(newVal,outerKey,outerIndex) {          
          this.contactInfos[outerIndex][outerKey] = newVal;
        },
        changeNews(newVal,outerKey,outerIndex) {          
          this.newsLists[outerIndex][outerKey] = newVal;
        },
        changeHistory(newVal,outerKey,outerIndex) {          
          this.historyLists[outerIndex][outerKey] = newVal;
        }, 
        
        removeLists (index, type) {
          if (index!==null && type) {
            /*需要根据index 和 type获取相应的数据序列号 */
            var id = '';
            switch(type){
              case 'news':
                id = this.newsLists[index]['id'];
                break;
              case 'history':
                id = this.historyLists[index]['id'];
                break;
              case 'message':
                id = this.messageLists[index]['id'];
                break;
              default:
                return false;  
            }
            this.postData('./index.php/admin/removeLists/'+type,{id, lang:this.language}, function(request){
              if(request && request.responseText){
                var result = JSON.parse(request.responseText);
                if(result['code']===0){
                  this.showModal('success', '删除成功');
                  this.getLists(type);
                  return true;
                }
                this.showModal('error','删除失败');
                return false;
              }
              this.showModal('error','删除失败');
              return false;
            }.bind(this))
          }
        },        
        
                
      },
      mounted () {        
        this.checkLoginStatus ();        
      }
    })