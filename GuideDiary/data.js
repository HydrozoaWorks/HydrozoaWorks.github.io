

const Version = 1.0;
function defaultdata() 
{
   const re = {
        v: 1.0,
        name: "黛",
        day: 1,
        stamina: 100, // 饱腹度值 (百分比)
        mental: 100,  // 精神力 (百分比)
        water: 100,//水分
        guideLevel: 0,
        exp: 0,     // exp值
        score: 5,
        killer: -1,//导致游戏结束的哨兵
        dideat: false,
        roomlevel: 0,
        roomlevel1: 0,
       par: -1,//配偶
      
        curenum: 0,
        npcs: [],
        dayevent: []
    };
    return re;
}
function createnpc(id, level, pollution, match)
{
    return {
        id: id,
        level: level,
        pollution: pollution,
        match: match ,
        trust: 0,
        love: 0,
        hasProposed:false,//曾经求婚过
        inhome: true,//在家
        curenum: 0,//被精神疏导的次数
        datenum: 0,//约会次数
        isEvolution:false,//是否进化
        savenum: 0,//被完全净化的次数
        isInjured: false,//是否还能进化
        injurednum:0//被伤害次数
    };

}
const people = [
    { id: 0,  name: "万泽", race: "犬系基因融合者", age: 22 },
    { id: 1,  name: "柏斯", race: "猫系基因融合者", age: 19 },
    { id: 2,  name: "山跃泉", race: "鹿系基因融合者", age: 28},
    { id: 3,  name: "阴烛", race: "蛇系基因融合者", age: 40 },
    { id: 4, name: "卡拉德罗斯", race: "人马系基因融合者", age: 35 },
    { id: 5,  name: "青玉", race: "榕树系基因融合者", age: 23},
    { id: 6,  name: "蔓枝", race: "狐系基因融合者", age: 26 },
    { id: 7, name: "奈克萨里斯", race: "王虫系基因融合者", age: 20 },
    { id: 8, name: "埃本维尔", race: "人造亡灵", age: 21 },
    { id: 9, name: "月倾", race: "海妖", age: 19 },
    { id: 10, name: "艾洛温", race: "人造精灵", age: 25 },
    { id: 11, name: "维尔特", race: "人造血族", age: 37 },
    { id: 12, name: "艾尔菲尔", race: "人造天使", age: 24 },
    { id: 13, name: "卡尔德里克", race: "人造恶魔", age: 31 },
    { id: 14,  name: "苍渊", race: "龙系基因融合者", age: 20 }
];
let data;
const shoplist = [
    { name: "低级营养液", cost: "1", text: "恢复30%饱腹度和30%水分" },
    { name: "中级营养液", cost: "5", text: "恢复60%饱腹度、60%水分和10%精神力" },
    { name: "高级营养液", cost: "25", text: "恢复100%饱腹度、100%水分和20%精神力" },
    { name: "豪华营养液", cost: "50", text: "恢复100%饱腹度、100%水分和30%精神力" },
    { name: "有机食物", cost: "100", text: "恢复100%饱腹度、100%水分和100%精神力" },
    { name: "C级精神突破剂", cost: "25", text: "可以让经验足以突破的D级向导升级为C级向导" },
    { name: "B级精神突破剂", cost: "125", text: "可以让经验足以突破的C级向导升级为B级向导" },
    { name: "A级精神突破剂", cost: "625", text: "可以让经验足以突破的B级向导升级为A级向导" },
    { name: "S级精神突破剂", cost: "3125", text: "可以让经验足以突破的A级向导升级为S级向导" },
    { name: "D级诊疗室", cost: "10", text: "能够禁锢住D级的暴走哨兵，避免在精神疏导时发生事故" },
    { name: "C级诊疗室", cost: "50", text: "能够禁锢住C级的暴走哨兵，避免在精神疏导时发生事故" },
    { name: "B级诊疗室", cost: "250", text: "能够禁锢住B级的暴走哨兵，避免在精神疏导时发生事故" },
    { name: "A级诊疗室", cost: "1250", text: "能够禁锢住A级的暴走哨兵，避免在精神疏导时发生事故" },
    { name: "S级诊疗室", cost: "6250", text: "能够禁锢住S级的暴走哨兵，避免在精神疏导时发生事故" },
    { name: "治疗躺椅", cost: "100", text: "比坐木头椅子强点，增加精神疏导中哨兵的舒适度" },
    { name: "柔软的诊疗床", cost: "1000", text: "很柔软，躺在上边更容易放松了。中幅增加精神疏导中哨兵的舒适度" },
    { name: "King Size诊疗床", cost: "10000", text: "大到可以容纳两个人在上边滚来滚去的尺寸，大幅增加精神疏导中哨兵的舒适度" }
];
const levelexpmax = [30, 150, 750, 3750, 17750];

document.getElementById('help-button').onclick = () =>
{
    showalert("信息", `<p>版本号：${Version}</p><p>作者：水螅</p><p>角色设计：水螅，夜九音</p><p>感谢：倾昀</p>`);
};
tempid = -1;
function showevents()
{
    if (data.dayevent.length > 0)
    {
        const temp = data.dayevent.pop();

        if (temp[0] == 0)
        {
            tempid = temp[1];
            showask("申请", `${people[temp[1]].race}哨兵${people[temp[1]].name}提出了和你的结婚申请`, "同意", "拒绝", marry, noaction,true);
        }
        else if (temp[0] == 1)
        {
            tempid = temp[1];
            showask("邀约", `${people[temp[1]].race}哨兵${people[temp[1]].name}邀请你今天与他约会`, "同意", "拒绝", godate, noaction);
        }
        else if (temp[0] == 2)
        {
            //0 xxx送来了一些手制小饼干 恢复饱腹度100精神10 （只有精灵
            //2xxx送给你一瓶无污染水 恢复水分100
            //3xxx送了你一管精神补剂 恢复精神10
            //4xxx送了你一些小零食 恢复水分30 饱腹度30
            //  1   xxx送给你一些珠宝，你拿去兑换了30积分（s级以上
            if (temp[2] == 0)
            {
                showalert("礼物", `${people[temp[1]].race}哨兵${people[temp[1]].name}送来了一些手制小饼干，你吃了后饱腹度水分和精神力都恢复了`, showevents);
                addmental(100);
                addstamina(100);
                addwater(100);
            }
            else if (temp[2] == 1)
            {
                showalert("礼物", `${people[temp[1]].race}哨兵${people[temp[1]].name}送给你一些珠宝，你拿去兑换了${temp[3]}积分`, showevents);
                addscore(temp[3]);
            }
            else if (temp[2] == 2)
            {
                showalert("礼物", `${people[temp[1]].race}哨兵${people[temp[1]].name}送给你一瓶无污染水，你喝了后身体里的水分恢复了`, showevents);
                addwater(100);
            }
            else if (temp[2] == 3)
            {
                showalert("礼物", `${people[temp[1]].race}哨兵${people[temp[1]].name}送了你一管精神补剂，你喝了后精神力恢复了一些`, showevents);
                addmental(10);
            }
            else if (temp[2] == 4)
            {
                showalert("礼物", `${people[temp[1]].race}哨兵${people[temp[1]].name}送了你一些小零食，你吃了后饱腹度和水分都恢复了一些`, showevents);
                addstamina(30);
                addwater(30);
            }
        }
       
        else if (temp[0] == 3)
        {
            showalert("配偶", `配偶${people[data.par].name}上交了工资${temp[1]}积分`);
        }
        else if (temp[0] == 4)
        {
            if (data.npcs[data.par].inhome)
            {
                showalert("礼物", `收到了${people[temp[1]].race}哨兵${people[temp[1]].name}送来的鲜花，被配偶${people[data.par].name}看到，${people[data.par].name}闹了一会别扭，用了好几个亲亲才哄好`);
            }
            else
            {
                showalert("礼物", `收到了${people[temp[1]].race}哨兵${people[temp[1]].name}送来的鲜花`);
            }
        }
    }
}

function showask(title,content,yestext,notext, yescallback,nocallback,isred=false)
{
    // 传入的回调函数
    if (isred)
    {
        
        document.getElementById('asktitle').style.backgroundColor = '#ed4545';
    }
    else
    {
       
        document.getElementById('asktitle').style.backgroundColor = '#f8d7da';
    }
        const yesCallback = function ()
        {
            confirmModal.hide();

            yescallback();
          
        };

        const noCallback = function ()
        {
            confirmModal.hide();

            nocallback();
         
        };

        // 设置模态框的标题和内容
        const modalTitle = title;
        const modalContent = content;

        // 获取模态框元素
        const modalTitleElement = document.getElementById('confirmModalLabel');
        const modalBodyElement = document.querySelector('#confirmModal .modal-body');

        // 设置模态框的标题和内容
        modalTitleElement.textContent = modalTitle;
        modalBodyElement.textContent = modalContent;

        // 显示模态框
        const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();

    document.getElementById('yes-button').innerText = yestext;
    document.getElementById('no-button').innerText = notext;
        // 设置 Yes 按钮的点击事件
        document.getElementById('yes-button').onclick = yesCallback;

        // 设置 No 按钮的点击事件
        document.getElementById('no-button').onclick = noCallback;


}
function showalert(modalTitle, modalContent,callbackev=null)
{
        // 获取模态框元素
        const modalTitleElement = document.getElementById('roomModalLabel');
        const modalBodyElement = document.querySelector('#roomModal .modal-body');

        // 设置模态框的标题和内容
    modalTitleElement.textContent = modalTitle;
    modalBodyElement.innerHTML = modalContent;

        // 显示模态框
        const roomModal = new bootstrap.Modal(document.getElementById('roomModal'));
        roomModal.show();

    function onConfirmClick()
    {
        document.getElementById('confirm-button').removeEventListener('click', onConfirmClick);
        roomModal.hide(); // 关闭模态框
        if (callbackev != null)
        {
            callbackev();
        }
    }
    document.getElementById('confirm-button').addEventListener('click', onConfirmClick);
}
function handleEventOnce(event)
{
    document.removeEventListener('DOMContentLoaded', handleEventOnce);
    if (!localStorage.getItem('guideDiaryData'))
    {
        newgame();
    } else
    {
       
        //读取存档
        const savedData = localStorage.getItem('guideDiaryData');
        data = JSON.parse(savedData);

        //对比版本号，如果不一样就重新载入
        b1 = false;
        if (data.v !== undefined)
        {
            if (data.v != Version)
            {
                b1 = true;
            }
        }
        else
        {
            b1 = true;
        }
        if (b1)
        {
            alert("版本已更新，将重新开始");
            newgame();
            return;
        }
        loadpage("main");
        showevents();
    }
}

document.addEventListener('DOMContentLoaded', handleEventOnce);

// 替换 card-body 内容的函数
function loadpage(pageurl)
{
    console.log('Loading page:', pageurl);
    const cardBody = document.querySelector('.card-body');
        cardBody.innerHTML = '';

        $('.card-body').load(pageurl + '.html .card-body', function (response, status, xhr)
        {
            if (status === "error")
            {
                console.error('Error loading page:', xhr.statusText);
            } else
            {
                if (pageurl == "main")
                {
                    setmain();
                }
                else if (pageurl == "setname")
                {
                    setname();
                }
                else if (pageurl == "game")
                {
                    setgameplay();
                }
            }
        });      
}

function getRandomItems(arr, num)
{
    // 打乱数组
    const shuffled = arr.sort(() => 0.5 - Math.random());
    // 选择前 num 个元素
    return shuffled.slice(0, num);
}
function getlvs(num)
{
    //返回lv文字
    if (num == 0)
    {
        return "D";
    }
    if (num == 1)
    {
        return "C";
    }
    if (num == 2)
    {
        return "B";
    }
    if (num == 3)
    {
        return "A";
    }
    if (num == 4)
    {
        return "S";
    }
    if (num == 5)
    {
        return "SS";
    }
}
function setmain()
{
   
    // 动态设置页面内容
    document.getElementById('name').innerText = data.name;
    document.getElementById('date').innerText = getdays(data.day);
    document.getElementById('stamina-bar').style.width = data.stamina + "%";
    document.getElementById('mental-bar').style.width = data.mental + "%";
    document.getElementById('water-bar').style.width = data.water + "%";
    document.getElementById('guide-level').innerText = getlvs(data.guideLevel);
    document.getElementById('exp-bar').style.width = (data.exp * 100 / levelexpmax[data.guideLevel]) + "%";
    document.getElementById('score').innerText = data.score;
    document.getElementById('list-title').innerText = "精神疏导申请";
    if (data.par != -1)
    {
        document.getElementById('par-name').innerText = "配偶 " +people[data.par].name;
    }
    else
    {
        document.getElementById('par-name').innerText = "";
    }
    // 生成精神疏导申请列表
    const applicantList = document.getElementById('applicant-list');
    applicantList.innerHTML = '';

    data.npcs.forEach(applicant =>
    {
        const applicantButton = document.createElement('button');
        applicantButton.className = 'applicant-button';
        applicantButton.onclick = () =>
        {
            tempid = applicant.id;
            showask("向导中心", `确定今日安排为对${people[applicant.id].name}进行精神疏导吗？`, "确定", "取消", cleanse, noaction);
        };

        // gif图片区域
        const gifDiv = document.createElement('div');
        gifDiv.className = 'gif-image';
        //  gifDiv.innerText = applicant.image;

        // 创建包裹图片和文字的容器
        const imgContainer = document.createElement('div');
        imgContainer.style.position = 'relative'; // 相对定位

        // 创建图片元素
        const img = document.createElement('img');
        img.src = "npc" + applicant.id + ".gif"; // 将图片路径赋值给 src
        img.alt = "申请人图像"; // 设置替代文本
        img.style.width = '100%'; // 设定图片宽度为100%
        img.style.height = 'auto'; // 自动调整高度

        // 将图片添加到容器中
        imgContainer.appendChild(img);

        if (!applicant.inhome)
        {
            // 创建右上角的文字元素
            const statusText = document.createElement('div');
            statusText.textContent = "出勤中"; // 设置文字内容
            statusText.style.position = 'absolute'; // 绝对定位
            statusText.style.top = '5px'; // 距离顶部5px
            statusText.style.right = '5px'; // 距离右侧5px
            statusText.style.color = 'red'; // 设置文字颜色为红色
            statusText.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // 背景颜色为半透明白色
            statusText.style.padding = '2px 5px'; // 添加一些内边距
            statusText.style.fontSize = '12px'; // 调整字体大小
            statusText.style.fontWeight = 'bold'; // 设置文字加粗

            // 将文字元素添加到容器中
            imgContainer.appendChild(statusText);
        }

        // 将容器添加到页面中
        gifDiv.appendChild(imgContainer);
        applicantButton.appendChild(gifDiv);

        // 信息区域
        const infoDiv = document.createElement('div');
        infoDiv.className = 'applicant-info';
        if (applicant.id == data.par)
        {
            infoDiv.innerHTML = `
        <div>${people[applicant.id].name} ${people[applicant.id].race} ${people[applicant.id].age}岁</div>
        <div>哨兵等级 ${getlvs(applicant.level)} 匹配率 ${applicant.match}%</div>
        <div>污染度 ${applicant.pollution}% 信任度 ${applicant.trust}%</div>
        <div>配偶 ${data.name}</div>
    `;
        }
        else
        {
            infoDiv.innerHTML = `
        <div>${people[applicant.id].name} ${people[applicant.id].race} ${people[applicant.id].age}岁</div>
        <div>哨兵等级 ${getlvs(applicant.level)} 匹配率 ${applicant.match}%</div>
        <div>污染度 ${applicant.pollution}% 信任度 ${applicant.trust}%</div>
    `;
        }
        applicantButton.appendChild(infoDiv);
        if (applicant.pollution == 0 || !applicant.inhome)
        {
            applicantButton.disabled = true; // 设置按钮为禁用状态
        }

        applicantList.appendChild(applicantButton);
    });
    document.getElementById('shop-button').innerText = "前往商店";
    document.getElementById('shop-button').onclick = () =>
    {
        setshop();
    };
    document.getElementById('room-button').onclick = () =>
    {
        showroom();
    };

    /*
    // 点击保存按钮时保存数据
    document.getElementById('save-button').onclick = () =>
    {
        localStorage.setItem('guideDiaryData', JSON.stringify(data));
        alert('数据已保存！');
    };
    */

    document.getElementById('delete-button').onclick = () =>
    {
        showask("确认", "确定要重新开始游戏吗？之前的存档将被清除","确定","取消", restart, noaction);
    
    };
    document.getElementById('rest-button').onclick = () =>
    {
        addmental ( 40);
        addtime(false);
    };
}

function restart()
{
    newgame();
}

function noaction()
{
    //啥也不发生
}

function cleanse()
{
    loadpage("game");
}

function setname()
{
  
    // 获取表单元素
    const form = document.getElementById('guide-form');

    // 监听表单提交事件
    form.onsubmit = (event) =>
    {
        event.preventDefault(); // 防止默认提交

        // 获取姓名输入框的值
        let name = document.getElementById('name').value;
        if (name.length > 4)
        {
            name = name.slice(0, 4);
        }
        data.name = name;

        // 将 data 存入 localStorage
        localStorage.setItem('guideDiaryData', JSON.stringify(data));
        showalert("向导中心",'数据已提交，请到诊疗室入职，开始您为期半年的实习工作吧');
        if (!localStorage.getItem('guideDiaryData'))
        {
            // 如果不存在，跳转到 setname.html
            showalert("向导中心",'数据提交失败');
        }
        else
        {
            // 跳转到 index.html
            loadpage("main");
        }
    };
}
const roomitem0 = ["空房间", "D级诊疗室", "C级诊疗室", "B级诊疗室", "A级诊疗室", "S级诊疗室"];
const roomitem1 = ["木椅子", "治疗躺椅", "柔软的诊疗床", "King Size诊疗床"];
function showroom()
{
    //弹框显示room状态
    content =  roomitem0[data.roomlevel] + "    " + roomitem1[data.roomlevel1];
    showalert("诊疗室详情", content);
}

function setshop()
{
    const applicantList = document.getElementById('applicant-list');
    applicantList.innerHTML = '';
    document.getElementById('list-title').innerText = "商店";
    document.getElementById('shop-button').innerText = "前往诊疗室";
    document.getElementById('shop-button').onclick = () =>
    {
        setmain();
    };

    // 生成商店列表
   // 0{ name: "低级营养液", cost: "1", text: "恢复30%饱腹度和30%水分" },
   // 1{ name: "中级营养液", cost: "5", text: "恢复60%饱腹度、60%水分和10%精神力" },
   // 2{ name: "高级营养液", cost: "25", text: "恢复100%饱腹度、100%水分和30%精神力" },
   // 3{ name: "有机食物", cost: "100", text: "恢复100%饱腹度、100%水分和100%精神力" },
   // 4{ name: "C级精神突破剂", cost: "25", text: "可以让经验足以突破的D级向导升级为C级向导" },
   // 5{ name: "B级精神突破剂", cost: "125", text: "可以让经验足以突破的C级向导升级为B级向导" },
   // 6{ name: "A级精神突破剂", cost: "625", text: "可以让经验足以突破的B级向导升级为A级向导" },
   // 7{ name: "S级精神突破剂", cost: "3125", text: "可以让经验足以突破的A级向导升级为S级向导" },
   // 8{ name: "D级诊疗室", cost: "10", text: "能够禁锢住D级的暴走哨兵，避免在精神疏导时发生事故" },
   // 9{ name: "C级诊疗室", cost: "50", text: "能够禁锢住C级的暴走哨兵，避免在精神疏导时发生事故" },
   // 10{ name: "B级诊疗室", cost: "250", text: "能够禁锢住B级的暴走哨兵，避免在精神疏导时发生事故" },
   // 11{ name: "A级诊疗室", cost: "1250", text: "能够禁锢住A级的暴走哨兵，避免在精神疏导时发生事故" },
   // 12{ name: "S级诊疗室", cost: "6250", text: "能够禁锢住S级的暴走哨兵，避免在精神疏导时发生事故" },
   // 13{ name: "治疗躺椅", cost: "10", text: "比坐木头椅子强点，增加精神疏导中哨兵的舒适度" },
   // 14{ name: "柔软的诊疗床", cost: "100", text: "很柔软，躺在上边更容易放松了。中幅增加精神疏导中哨兵的舒适度" },
   // 15{ name: "King Size诊疗床", cost: "1000", text: "大到可以容纳两个人在上边滚来滚去的尺寸，大幅增加精神疏导中哨兵的舒适度" }
 

    for (num = 0; num < shoplist.length;num++)
    {
        applicant = shoplist[num];
        b1 = 0;
        if (num <= 4 && !data.dideat)
        {
            if (data.stamina == 100 && data.water == 100 && data.mental == 100)
            {
                b1 = 2;
            }
            else
            {
                b1 = 1;
            }
        }
        else if (num <= 8)
        {
            if (num - 5 == data.guideLevel)
            {
                if (data.exp >= levelexpmax[data.guideLevel])
                {
                    b1 = 1;
                }
                else
                {
                    b1 = 2;
                }
            }
            else
            {
                b1 = 0;
            }
        }
        else if (num <= 13)
        {
            if (num - 9 == data.roomlevel)
            {
                b1 = 1;
            }
            else
            {
                b1 = 0;
            }
        }
        else if(num<=16)
        {
            if (num - 14 == data.roomlevel1)
            {
                b1 = 1;
            }
            else
            {
                b1 = 0;
            }
        }
        if (b1>0)
        {
            
            const applicantButton = document.createElement('button');
            applicantButton.className = 'applicant-button';
            if (b1 == 2)
            {
                applicantButton.disabled = true; // 设置按钮为禁用状态
            }
            else
            {
               const num15 = num;
                applicantButton.onclick = () =>
                {
                    buy(num15);
                };
            }
            const infoDiv = document.createElement('div');
            infoDiv.className = 'applicant-info';
            infoDiv.innerHTML = `
        <div>${applicant.name}<div class=\"justify-content-end\">积分 ${applicant.cost}</div></div>
        <div style=\"font-size: 0.8em;\">${applicant.text}</div>
    `;
            applicantButton.appendChild(infoDiv);

            applicantList.appendChild(applicantButton);
        }


    }
}
function buy(num)
{
    console.log("buy" + num);  
    if (data.score < shoplist[num].cost)
    {
        showalert("商店","积分不够……");
        return;
    }
    addscore(-shoplist[num].cost);
   
    getitem(num);
    setshop();
}
function getitem(num)
{
   
    if (num <= 4)
    {
        data.dideat = true;
        if (num == 0)
        {
            addstamina(30);
            addwater(30);
        }
        else if (num == 1)
        {
            addstamina(60);
            addwater(60);
            addmental(10);
        }
        else if (num == 2)
        {
            addstamina(100);
            addwater(100);
            addmental(20);
        }
        else if (num == 3)
        {
            addstamina(100);
            addwater(100);
            addmental(30);
        }
        else if (num == 4)
        {
            addstamina(100);
            addwater(100);
            addmental(100);
        }
    }
    else if (num >= 5 && num <= 8)
    {
        data.guideLevel++;
        data.exp = 0;
        //刷新页面 增加新的小哥
        document.getElementById('guide-level').innerText = getlvs(data.guideLevel);
        document.getElementById('exp-bar').style.width = (data.exp * 100 / levelexpmax[data.guideLevel]) + "%";
        if (data.guideLevel == 1)
        {
            data.npcs.push(createnpc(3,1,60,70));
            data.npcs.push(createnpc(4, 1, 50, 75));
            data.npcs.push(createnpc(5, 1, 80, 69));
        }
        if (data.guideLevel == 2)
        {
            data.npcs.push(createnpc(6, 2, 70, 71));
            data.npcs.push(createnpc(7, 2, 55, 63));
            data.npcs.push(createnpc(8, 2, 60, 55));
        }
        if (data.guideLevel == 3)
        {
            data.npcs.push(createnpc(9, 3, 80, 66));
            data.npcs.push(createnpc(10, 3, 70, 59));
            data.npcs.push(createnpc(11, 3, 80, 48));
        }
        if (data.guideLevel == 4)
        {
            data.npcs.push(createnpc(12, 4, 90, 51));
            data.npcs.push(createnpc(13, 4, 95, 35));
            data.npcs.push(createnpc(14, 4, 90, 40));
        }
    }
    else if (num >= 9 && num <= 13)
    {
        data.roomlevel++;
    }
    else if (num >= 14 && num <= 16)
    {
        data.roomlevel1++;
        console.log(data.roomlevel1);
    }

}
const game = {
    obedience: 0,
    comfort: 0,
    painLevel: 0
};

function setgameplay()
{
    didevent = false;
    askcomfort = false;
    showpain = false;
    data.curenum++;
    //有人强行插队
   let npc = getnpc(tempid);

    temp = null;
    for (const npc0 of data.npcs)
    {
        if (npc0.love >= 5 && npc0.isin && npc0.pollution > 30 && npc0.level > npc.level && npc0.level>=3 && Math.random() < 0.1)
        {
            temp = npc0;
            break;
        }
    }
    if (temp != null)
    {
        showalert("向导中心", `${getlvs(temp.level)}级哨兵${people[temp.id].name}使用高级哨兵的权利要求您今日为他服务`);
        npc = temp;
    }

    
    npc.curenum++;
    // 动态设置页面内容
    document.getElementById('npc-img').src = "npc" + npc.id + ".gif";
    document.getElementById('npc-name').innerText = people[npc.id].name;
    document.getElementById('npc-race').innerText = people[npc.id].race;
    document.getElementById('npc-match').innerText = "契合度 "+npc.match+"%";
    document.getElementById('pollution-bar').style.width = npc.pollution + "%";
    opollution = npc.pollution;
    //每个人有个基础服从度+trust 不能大于100
    trusts = [70, 50, 60, 40, 45, 20, 30, 50, 0, 10, 30, 0, 10, 0, 10];
    num1 = (data.guideLevel - npc.level) * 10;
    if (num1 < 0)
    {
        num1 = 0;
    }
   game.obedience = npc.trust + trusts[npc.id] + num1;
    if (game.obedience > 100)
    {
        game.obedience = 100;
    }
    document.getElementById('obedience-bar').style.width = game.obedience + "%";
    //舒适度
    game.comfort = data.roomlevel1 * 5;
    
   
    document.getElementById('comfort-bar').style.width = game.comfort + "%";
    //痛苦度
    game.painLevel = npc.pollution ;
    document.getElementById('painLevel-bar').style.width = game.painLevel + "%";
    //精神力
    document.getElementById('mental-bar').style.width = data.mental + "%";

    const gameplayDiv = document.getElementById('gameplay');
  
    gameplayDiv.style.display = 'none'; // 隐藏
    const btsDiv = document.getElementById('bts');
  
    isin = false;
    document.getElementById('act2-button').disabled = true;

    action = -1;
    //安抚
    document.getElementById('act0-button').onclick = () =>
    {
        action = 0;
        gameplayDiv.style.display = 'block';
        btsDiv.style.display = 'none';
        //舒适度作为系数乘上去 0.7-1.3 1-1.5
        speed = (1.5+npc.level*0.5 - game.obedience / 100) * (1-game.comfort / 200 );
        //console.log(speed + "_" + game.obedience + "_" + game.comfort);
     
        if (speed < 0.1)
        {
            speed = 0.1;
        }
        redw = (0.5 - game.painLevel / 400) ;
        if (redw < 0.01)
        {
            redw = 0.01;
        }

        startTriangleMovement(
            speed, // 移动速度
            redw // 红色部分比例
        );
    };
    //进入精神海
    document.getElementById('act1-button').onclick = () =>
    {
        action = 1;
        gameplayDiv.style.display = 'block';
        btsDiv.style.display = 'none';
        speed = (2.5 + npc.level * 0.5 - game.obedience / 100) * (1-game.comfort / 200 );
        console.log(speed);
        if (speed < 0.1)
        {
            speed = 0.1;
        }
        redw = (0.3 - game.painLevel / 400);
        if (redw < 0.01)
        {
            redw = 0.01;
        }
        startTriangleMovement(
            speed, // 移动速度
            redw // 红色部分比例
        );
    };
    //净化
    document.getElementById('act2-button').onclick = () =>
    {
        action = 2;
        gameplayDiv.style.display = 'block';
        btsDiv.style.display = 'none';
        speed = (2 + npc.level * 0.5 - game.obedience / 100) * (1-game.comfort / 200 );
        console.log(speed);
        if (speed < 0.1)
        {
            speed = 0.1;
        }
        redw = (0.35 - game.painLevel / 400);
        if (redw < 0.01)
        {
            redw = 0.01;
        }
        startTriangleMovement(
            speed, // 移动速度
            redw // 红色部分比例

        );
    };
    //结束
    document.getElementById('quit-button').onclick = () =>
    {
        addlog(`<div>你认为自己无法完成这次精神疏导，在事情还没有恶化前结束了本次治疗</div>`);
        endgame(npc);
    };
   
   
    // 清理log
    const applicantList = document.getElementById('log-container');
    applicantList.innerHTML = '';
    if (npc.trust < 70)
    {
        if (npc.id == 0 || npc.id == 2 || npc.id == 7 || npc.id == 10 || npc.id == 14)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室并礼貌的和你打了招呼</div>`);
        }
        else if (npc.id == 1 || npc.id == 4 || npc.id == 6)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室并热情的和你打了招呼</div>`);
        }
        else if (npc.id == 8)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室后一言不发，只是直勾勾的盯着你</div>`);
        }
        else if (npc.id == 11)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室后不耐烦的和你打了招呼</div>`);
        }
        else if (npc.id == 5 || npc.id == 12 || npc.id == 3)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室后一言不发，只是静静地坐在那里</div>`);
        }
        else if (npc.id == 9 || npc.id == 13)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室，漫不经心的和你打了招呼</div>`);
        }
    }
    else
    {
        if (npc.id == 0)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室坐下，礼貌的和你打了招呼，他的精神体想要扑到你身上，被他拦住了</div>`);
        }
        else if (npc.id == 1)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室后，他的精神体轻巧地跳到你的膝盖上翻出了肚皮</div>`);
        }
        else if (npc.id == 2)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室坐下。他的精神体走到你身边温柔的舔了舔你的脸颊</div>`);
        }
        else if (npc.id == 3)
        {
            addlog(`<div>${people[npc.id].name}沉默的在你的对面坐下，但他的精神体却缓缓的缠上了你的小腿</div>`);
        }
        else if (npc.id == 4)
        {
            addlog(`<div>${people[npc.id].name}给了你一个大大的拥抱后快乐的在你对面坐下</div>`);
        }
        else if (npc.id == 5)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室坐下，你感到他精神体的树枝轻抚了一下你的头顶</div>`);
        }
        else if (npc.id == 6)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室后，他的精神体先于他凑到你身边撒娇了起来</div>`);
        }
        else if (npc.id == 7)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室，向你行了军礼后端端正正的坐下，淡色的眼睛一瞬不瞬的看着你</div>`);
        }
        else if (npc.id == 8)
        {
            addlog(`<div>${people[npc.id].name}沉默的在你对面坐下，向你挤出了一个生涩的笑容</div>`);
        }
        else if (npc.id == 9)
        {
            addlog(`<div>${people[npc.id].name}摇曳着进入诊疗室，用令人神魂颠倒的声音向你打了招呼，你对他说别夹，他冲你做了个鬼脸</div>`);
        }
        else if (npc.id == 10)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室，快活的和你打了招呼，还分了你一些他手制的小饼干</div>`);
        }
        else if (npc.id == 11)
        {
            addlog(`<div>${people[npc.id].name}飘进诊疗室，放松的躺在了你面前，还热情地邀请你躺到他怀里，你礼貌的拒绝了</div>`);
        }
        else if (npc.id == 12)
        {
            addlog(`<div>${people[npc.id].name}一言不发的进入诊疗室坐下，但他的精神体光球很不稳重的在你面前蹦蹦跳跳，似乎是在快乐的向你打招呼</div>`);
        }
        else if (npc.id == 13)
        {
            addlog(`<div>${people[npc.id].name}气定神闲的在诊疗室里坐下，而他带着尖头的尾巴在你的脚踝上绕来绕去</div>`);
        }
        else if (npc.id == 14)
        {
            addlog(`<div>${people[npc.id].name}进入诊疗室，礼貌的和你打了招呼，而他的精神体却毫不客气地缩小了体型像是占领领地一样盘在了你的头顶</div>`);
        }
    }
   
   
    async  function startTriangleMovement(moveSpeed, redRatio)
    {
      
        const colorBar = document.querySelector('.color-bar');
        const redPart = document.querySelector('.red-part');
        const triangle = document.getElementById('triangle');
        const gameplay = document.getElementById('gameplay');
        const rectWidth = gameplay.offsetWidth;

        // 设置灰色和红色的比例
        const totalWidth = colorBar.offsetWidth;
        grayRatio = 1 - redRatio;
        const grayWidth = totalWidth * grayRatio;
        const redWidth = totalWidth * redRatio;

        redPart.style.width = `${redWidth}px`;

        let direction = 1; // 1 for right, -1 for left

        const colorBarLeft = (rectWidth - totalWidth) / 2;
        let currentLeft = colorBarLeft;

        function moveTriangle()
        {
            currentLeft += direction * moveSpeed;

            // 如果碰到色条的边缘，反向移动
            if (currentLeft <= colorBarLeft - triangle.offsetWidth)
            {
                currentLeft = colorBarLeft - triangle.offsetWidth;
                direction = 1;
            } else if (currentLeft >= totalWidth - triangle.offsetWidth + colorBarLeft)
            {
                currentLeft = totalWidth - triangle.offsetWidth + colorBarLeft;
                direction = -1;
            }

            triangle.style.left = `${currentLeft}px`;
        }

        const intervalId = setInterval(moveTriangle, 10);
        await delay(100); // 等待 0.1 秒

        document.addEventListener('click', () =>
        {
            clearInterval(intervalId); // 停止移动

            const triangleCenter = currentLeft + triangle.offsetWidth;

            // 判断三角形指向的颜色
            if (triangleCenter <= grayWidth + colorBarLeft)
            {
                
                lose(npc);
            } else
            {
            
                win(npc);
            }
        }, { once: true });
    }
}
fadelog = [];
 function showFadingText(text)
{
    fadelog.push(text);
    showfadelog();
  
}
onfade = false;
async function showfadelog()
{
    if (!onfade)
    {
        onfade = true;
        while (fadelog.length > 0)
        {
            // 创建一个元素来显示文字
            const textElement = document.createElement('div');
            textElement.className = 'fade-text';
            textElement.innerHTML = fadelog.shift();

            // 将元素添加到页面（例如添加到body中）
            document.body.appendChild(textElement);

            // 0.5秒后开始淡入淡出
            setTimeout(() =>
            {
                textElement.classList.add('fade-text');
            }, 0);

            // 动画结束后移除元素
            setTimeout(() =>
            {
                document.body.removeChild(textElement);
            }, 1000); // 1秒的动画时间
            await delay(1000);
        }


        onfade = false;
    }
   

   
}


function addcomfort(num)
{

    game.comfort += num;
  
    if (game.comfort < 0)
    {
        game.comfort = 0;
    }
    else if (game.comfort > 100)
    {
        game.comfort = 100;
    }
  
    document.getElementById('comfort-bar').style.width = game.comfort + "%";
}
function addpainLevel(npc,num)
{
    //匹配度影响痛苦
    num = num * (3 - npc.match / 50);
    game.painLevel += num;
    if (game.painLevel < 0)
    {
        game.painLevel = 0;
    }
    else if (game.painLevel > 100)
    {
        game.painLevel = 100;
    }
    document.getElementById('painLevel-bar').style.width = game.painLevel + "%";
}
function addpollutionongame(npc0, num)
{
    console.log("污染度"+npc0.pollution + "_" + num);
    npc0.pollution += num;
    if (npc0.pollution < 0)
    {
        npc0.pollution = 0;
    }
    else if (npc0.pollution > 100)
    {
        npc0.pollution = 100;
    }
    npc0.pollution = Math.floor(npc0.pollution);
    console.log("污染度" + npc0.pollution );
    document.getElementById('pollution-bar').style.width = npc0.pollution + "%";
}
function addlog(text)
{
    // 使用函数显示文字
    showFadingText(text);
    const applicantList = document.getElementById('log-container');
    const infoDiv = document.createElement('div');
    //infoDiv.className = 'applicant-info';
    infoDiv.innerHTML = text;
    applicantList.appendChild(infoDiv);
}
didevent = false;
askcomfort = false;
showpain = false;
function win(npc)
{
    const gameplayDiv = document.getElementById('gameplay');
    const btsDiv = document.getElementById('bts');
    btsDiv.style.display = 'flex';
    gameplayDiv.style.display = 'none';
    if (action == 0)
    {
        //安抚成功 舒适度增加 痛苦值减少 刷新界面 基数5 差1级增加5 痛苦减少10 精神力减少5
        num1 = data.guideLevel - npc.level;
        if (num1 < 0)
        {
            num1 = 0;
        }
        num1++;
      
        addcomfort(num1 * 10);
        addpainLevel(npc,num1 * -30);
        addmental(-5);
        if (askcomfort)
        {
            addcomfort(num1 * 10);
            addlog(`<div>你给了${people[npc.id].name}期待已久的安抚，他黏黏糊糊的蹭着你，表示自己感觉好多了</div>`);
            askcomfort = false;
        }
        else
        {

            addlog(`<div>你用一些温柔的肢体接触安抚了${people[npc.id].name}，他对你放松了身体</div>`);
        }
    }
    else if (action == 1)
    {
      
        //进入精神海成功 精神力-20
        isin = true;
        addmental(-15);
        addpainLevel(npc,5);
        document.getElementById('act1-button').disabled = true;
        document.getElementById('act2-button').disabled = false;
        addlog(`<div>你成功进入了${people[npc.id].name}的精神海，这一瞬的刺激令${people[npc.id].name}全身都绷紧了</div>`);
    }
    else if (action == 2)
    {
        //净化成功 D一次20 c!!
        addmental(-8);
        num1 = data.guideLevel - npc.level;
        if (num1 < 0)
        {
            num1 = 0;
        }
        num1++;
   
        addpollutionongame(npc, -10 * num1);
        addpainLevel(npc,5);
        addlog(`<div>你成功净化了${people[npc.id].name}精神海的一小片区域</div>`);
        if (npc.pollution < 1)
        {
            
            //净化完成
            npc.savenum++;
            if (data.guideLevel == npc.level && npc.savenum >= 10 && !npc.isInjured && npc.trust == 100)
            {
               
                npc.savenum = 0;
                npc.level++;
                npc.pollution = 0;
                npc.match = 100;
                npc.love = 20;
                npc.isEvolution = true;
                addmental(-100);
                addwater(-100);
                showalert("医学奇迹", `${people[npc.id].name}的精神等级从${getlvs(npc.level - 1)}级升到了${getlvs(npc.level)}级`);
                addlog(`<div>你彻底净化${people[npc.id].name}精神海中的所有污染的瞬间，他的精神海反过来包裹住了你的伸入其中的精神触角，你试图逃离，却被${people[npc.id].name}和他的精神体一起拥入怀中，精神触角传来的强烈刺激令你失去了意识，等你醒过来时，${people[npc.id].name}的精神等级竟从${getlvs(npc.level - 1)}级升到了${getlvs(npc.level)}级</div>`);
            }
            else
            {
                addlog(`<div>你彻底净化了${people[npc.id].name}精神海中的所有污染，他对此非常感激</div>`);
                addmatch(npc.id, 1);
                addtrust(npc.id, 10);
            }
            endgame(npc);
            return;
        }
    }
    //痛苦过高
    if (game.painLevel == 100)
    {
        if (data.roomlevel > npc.level)
        {
            npc.trust = 0;
            addmatch(npc.id, -5);
         
            npc.isInjured = true;
            npc.injurednum++;

            addlog(`<div>${people[npc.id].name}陷入了暴走状态，所幸被治疗室的禁锢装置控制了行动，失控哨兵管理中心派人来带走了他。他会被注射一些虽然有效但远比精神疏导粗暴的净化药物来强迫他恢复神智，这些药物能够救他的命，但也会让他的精神海受到一些不可逆的损伤</div>`);
            if (npc.injurednum >= 3 && npc.level > 0)
            {
                npc.injurednum = 0;
                npc.level--;
               
                addlog(`<div>${people[npc.id].name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级</div>`);
            
                showalert("医疗事故", `${people[npc.id].name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级`);
          
            }
        }
        else if (data.water >= 50)
        {
            addwater(-50);
            npc.love = 20;
            addlog(`<div>${people[npc.id].name}陷入了暴走状态，他挣脱束缚将你扑在了身下</div>`);
            addlog(`<div>${people[npc.id].name}摄取了你的水分，理智逐渐回归，他充满歉意的将已经昏迷的你安置好后离开了</div>`);
        }
        else
        {
            addlog(`<div>${people[npc.id].name}在袭击你后堕化为异兽离开了，你的精神海受到了无法修复的损坏，再也无法从事向导这一职业</div>`);
            endgame(npc,false);
            return;
        }

        endgame(npc);
        return;
    }
    else if (game.painLevel >= 80 && !showpain)
    {
        showpain = true;
        addlog(`<div>${people[npc.id].name}的獠牙露了出来，他死死的盯着你，已经快要无法控制自己的理智</div>`);
    }
    else if ( (action == 0 || action == 2))
    {
        if (Math.random() < 0.2)
        {
            if (!didevent)
            {
                npc.love++;
            }
            didevent = true;
            
            //随机事件
            if (npc.love > 5 && Math.random() < 0.3)
            {
                askcomfort = true;
                addlog(`<div>${people[npc.id].name}依恋的表示想要得到你更多的安抚</div>`);
            }
            else
            {
                eventlogs = [
                    `<div>${people[npc.id].name}的精神体在哼哼唧唧的蹭你的膝盖</div>`,
                    `<div>${people[npc.id].name}的精神体扑到你怀里舔了你的脸</div>`,
                    `<div>${people[npc.id].name}的精神体舒服的喵喵叫了起来</div>`,
                    `<div>${people[npc.id].name}的精神体在你的膝盖上发出了呼噜呼噜的声音</div>`,
                    `<div>${people[npc.id].name}的精神体用它的鹿角轻轻蹭了蹭你的脸颊</div>`,
                    `<div>${people[npc.id].name}的精神体静静的趴在你怀里，时不时扬起脖颈舔一舔你的脸来为你鼓劲</div>`,
                    `<div>${people[npc.id].name}的尾巴缠住了你的脚踝</div>`,
                    `<div>${people[npc.id].name}的精神体舔舐了你的手指</div>`,
                    `<div>${people[npc.id].name}在失神中将你抱入了怀里，他意识到后有点害羞，却依然没有松开手</div>`,
                    `<div>${people[npc.id].name}将你抱起来，让你的额头贴上他的额头来方便你接近他的精神海</div>`,
                    `<div>${people[npc.id].name}柔软的树枝围绕着你编织成了一个笼子</div>`,
                    `<div>${people[npc.id].name}被精神相接的刺激弄得眼眶通红，无法忍受的用枝条束缚了你的四肢</div>`,
                    `<div>${people[npc.id].name}和他的精神体将你夹在中间挨挨蹭蹭的和你分享彼此的体温</div>`,
                    `<div>${people[npc.id].name}精神体毛茸茸的大尾巴在你怀里摇来摇去</div>`,
                    `<div>精神相接的刺激让${people[npc.id].name}的镰爪无法控制的从身体上冒了出来，他意识到了这点，颤抖着努力收起镰爪以免割伤你</div>`,
                    `<div>随着精神交接的深入，你的气味对${people[npc.id].name}的诱惑力逐渐变得无法抵挡，一晃神间，被本能操纵的他已经将你抱在怀里，弯下腰埋首在你颈间蹭来蹭去的攫取着你的味道</div>`,
                    `<div>${people[npc.id].name}冰冷的手指碰触了你的每一片皮肤</div>`,
                    `<div>${people[npc.id].name}冰冷的体温令你流出了战栗的泪水，他被此吸引，情不自禁的一点点舔掉了你的泪水</div>`,
                    `<div>${people[npc.id].name}在你耳边吟唱着勾魂摄魄的歌曲，你担心自己的精神力被他消耗，快速捂住了他的嘴</div>`,
                    `<div>和${people[npc.id].name}精神海的纠缠令你产生了没入深海的幻觉，就在你觉得自己已经无法呼吸的时候，${people[npc.id].name}靠近你为你渡了一口气，而幻觉也就此消失了</div>`,
                    `<div>精神相接的刺激令${people[npc.id].name}全身都泛起了粉红色，他害羞的颤抖着，几乎不敢直视你的眼睛</div>`,
                    `<div>${people[npc.id].name}无法承受过多的刺激想要逃开一点距离，却被你牢牢抓住了手腕，那双在战场上可以徒手撕毁星舰的双手此时却柔顺的任你束缚，丝毫无法推拒你</div>`,
                    `<div>${people[npc.id].name}反复舔舐着你的颈部，以此抑制他咬下去的冲动，你想要推开他，却发现根本无法抵抗他的巨力</div>`,
                    `<div>${people[npc.id].name}将你拢在怀里，他冰冷的体温令你分神，而这点神智立刻又被他海潮般的精神力拽了回来被他的精神海挤压揉搓</div>`,
                    `<div>${people[npc.id].name}的翅膀拢住了你，将你紧紧拥在他的怀中，他蒙住眼睛的脸上表情却依然如此圣洁，仿佛这一切都不是他做的一样</div>`,
                    `<div>${people[npc.id].name}的精神体光球们挨挨挤挤的停在你的肩上，哪个都不愿意离开</div>`,
                    `<div>${people[npc.id].name}扬起脖颈舒出了一口气，这仿若呻吟一样的声音令你有些不好意思，他却似笑非笑的看着你，俯身在你耳边吹了一口气</div>`,
                    `<div>${people[npc.id].name}的尾巴卷在了你的腰上，尾尖一点一点划过你的皮肤，你想要抓开它，却被他轻轻束住了双手</div>`,
                    `<div>${people[npc.id].name}的呼吸有些急促，而他的精神体不知何时攀上了你的身体，一寸寸的摩挲过你的皮肤，让你甚至有点担心自己会被束紧到无法呼吸。你略带责备的看了${people[npc.id].name}一眼，他努力平息着呼吸，放松了对你的束缚</div>`,
                    `<div>${people[npc.id].name}精神体的龙身突然变大，将你含入了它的口中，${people[npc.id].name}耳根薄红，匆匆忙忙的将你抱了出来</div>`
                ];
                num0 = npc.id * 2 + Math.floor(Math.random() * 2);
                addlog(eventlogs[num0]);
            }
        }
    }
    //失去水分
    if (Math.random() < 0.1)
    {
        addwater(-10);
        addlog(`<div>精神过于集中导致的流汗让你失去了一些水分</div>`);
    }
    if (data.mental == 0)
    {
        addlog(`<div>你的精神力已经枯竭，不得不结束了此次精神疏导</div>`);
        endgame(npc);
        return;
    }
}
function lose(npc)
{
    const gameplayDiv = document.getElementById('gameplay');
    const btsDiv = document.getElementById('bts');
    btsDiv.style.display = 'flex';
    gameplayDiv.style.display = 'none';
    if (action == 0)
    {
        addmental(-5);
        //安抚失败
        if (askcomfort)
        {
            askcomfort = false;
            addlog(`<div>虽然你的安抚失败了，但你愿意倾听他声音的态度令${people[npc.id].name}无视了精神海的刺痛感</div>`);
        }
        else
        {
            addpainLevel(npc,5);
            addlog(`<div>你的安抚失败了，${people[npc.id].name}更加躁动不安起来</div>`);
        }
    }
    else if (action == 1)
    {
        
        //进入精神海失败 精神力-20
        addmental(-15);
        addpainLevel(npc,20);
        addlog(`<div>你未能成功进入${people[npc.id].name}的精神海，这次失败的侵入令${people[npc.id].name}感到了剧烈的疼痛</div>`);
    }
    else if (action == 2)
    {
      
        //净化失败 精神力-10
        addmental(-8);
        addpainLevel(npc,10);
        addlog(`<div>你净化的尝试失败了，${people[npc.id].name}露出痛苦的表情</div>`);
    }

    //痛苦过高
    if (game.painLevel == 100)
    {
        if (data.roomlevel > npc.level)
        {
            npc.trust = 0;
            addmatch(npc.id, -5);
            npc.isInjured = true;
            npc.injurednum++;

            addlog(`<div>${people[npc.id].name}陷入了暴走状态，所幸被治疗室的禁锢装置控制了行动，失控哨兵管理中心派人来带走了他。他会被注射一些虽然有效但远比精神疏导粗暴的净化药物来强迫他恢复神智，这些药物能够救他的命，但也会让他的精神海受到一些不可逆的损伤</div>`);
            if (npc.injurednum >= 3 && npc.level > 0)
            {
                npc.injurednum = 0;
                npc.level--;
                showalert("医疗事故", `${people[npc.id].name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级`);
                addlog(`<div>${people[npc.id].name}的哨兵等级从${getlvs(npc.level + 1)}级降到了${getlvs(npc.level)}级</div>`);
            }
        }
        else if (data.water >= 50)
        {
            addwater(-50);
            npc.love = 20;
            addlog(`<div>${people[npc.id].name}陷入了暴走状态，他挣脱束缚将你扑在了身下</div>`);
            addlog(`<div>${people[npc.id].name}摄取了你的水分，理智逐渐回归，他充满歉意的将已经昏迷的你安置好后离开了</div>`);
        }
        else
        {
            addlog(`<div>${people[npc.id].name}在袭击你后堕化为异兽离开了，你的精神海受到了无法修复的损坏，再也无法从事向导这一职业</div>`);
            endgame(npc,false);
            return;
        }

        endgame(npc);
        return;
    }
    else if (game.painLevel >= 80 && !showpain)
    {
        showpain = true;
        addlog(`<div>${people[npc.id].name}的獠牙露了出来，他死死的盯着你，已经快要无法控制自己的理智</div>`);
    }

    if (Math.random() < 0.1)
    {
        addwater(-10);
        addlog(`<div>精神过于集中导致的流汗让你失去了一些水分</div>`);
    }
    if (data.mental == 0)
    {
        addlog(`<div>你的精神力已经枯竭，不得不结束了此次精神疏导</div>`);
        endgame(npc);
        return;
    }
}
function endgame(npc0,checkscore = true)
{
    console.log("endgame");
    const applicantList = document.getElementById('log-container');
    const btsDiv = document.getElementById('bts');
    btsDiv.style.display = 'none';
    if (checkscore)
    {
        console.log("endgame1");
        //计算获得的信赖度 积分 经验值
        num1 = opollution - npc0.pollution;
        addtrust(npc0.id, num1 / 2);
        add = [0.1, 0.3, 1, 4, 16, 70];
        addnum = Math.floor(add[npc0.level] * num1);
        addscore(addnum);
        addexp(addnum);
        addlog(`<div>在本次精神疏导中获得积分${addnum}</div>`);
    
        const Button1 = document.createElement('button');
        Button1.className = 'custom-button';
        Button1.innerHTML = "离开诊疗室";
        Button1.onclick = () =>
        {
            addtime(false);
        };
      
        applicantList.appendChild(Button1);

       
       
    }
    else
    {
        data.killer = npc0.id;
        const Button1 = document.createElement('button');
        Button1.className = 'custom-button';
        Button1.innerHTML = "结束";
        Button1.onclick = () =>
        {
            showalert("Game Over", "请确保治疗室等级足够禁锢前来治疗的哨兵");
            gameover(2);
        };
        applicantList.appendChild(Button1);
    }
}

function addscore(num)
{
    data.score += num;
    if (data.score < 0)
    {
        data.score = 0;
    }
    else if (data.score > 10000000)
    {
        data.score = 10000000;
    }
    data.score = Math.floor(data.score);
    const staminaBar = document.getElementById('score');
    if (staminaBar)
    {
        staminaBar.innerText = data.score;
    }
}
function addexp(num)
{
    data.exp += num;
    if (data.exp > levelexpmax[data.guideLevel])
    {
        data.exp = levelexpmax[data.guideLevel];
    }
}
function addpollution(id, num)
{
    tnpc = getnpc(id);
    if (tnpc != null)
    {
        tnpc.pollution += num;
        if (tnpc.pollution < 0)
        {
            tnpc.pollution = 0;
        }
        else if (tnpc.pollution > 99)
        {
            tnpc.pollution = 99;
        }
        tnpc.pollution = Math.floor(tnpc.pollution);
    }
}
function addmatch(id, num)
{
    tnpc = getnpc(id);
    if (tnpc != null)
    {
        tnpc.match += num;
        if (tnpc.match < 0)
        {
            tnpc.match = 0;
        }
        else if (tnpc.match > 100)
        {
            tnpc.match = 100;
        }
    
    }
}
function addtrust(id, num)
{
    tnpc = getnpc(id);
    if (tnpc != null)
    {
        tnpc.trust += num;
        if (tnpc.trust < 0)
        {
            tnpc.trust = 0;
        }
        else if (tnpc.trust > 100)
        {
            tnpc.trust = 100;
        }
        tnpc.trust = Math.floor(tnpc.trust);
    }
}

function addwater(num)
{
    data.water += num;
    if (data.water < 0)
    {
        data.water = 0;
    }
    else if (data.water > 100)
    {
        data.water = 100;
    }
    data.water = Math.floor(data.water);
    const staminaBar = document.getElementById('water-bar');
    if (staminaBar)
    {
        // 如果存在，更新其宽度
        staminaBar.style.width = data.water + "%";
    }
}
function addmental(num)
{
    data.mental += num;
    if (data.mental < 0)
    {
        data.mental = 0;
    }
    else if (data.mental > 100)
    {
        data.mental = 100;
    }
    data.mental = Math.floor(data.mental);
    const staminaBar = document.getElementById('mental-bar');
    if (staminaBar)
    {
        // 如果存在，更新其宽度
        staminaBar.style.width = data.mental + "%";
    }

}
function addstamina(num)
{
    data.stamina += num;
    if (data.stamina < 0)
    {
        data.stamina = 0;
    }
    else if (data.stamina > 100)
    {
        data.stamina = 100;
    }
    data.stamina = Math.floor(data.stamina);
    const staminaBar = document.getElementById('stamina-bar');
    if (staminaBar)
    {
        // 如果存在，更新其宽度
        staminaBar.style.width = data.stamina + "%";
    }
}

function getdays(day)
{
    // 定义每个月的天数
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // 遍历每个月，确定day属于哪个月
    let month = 0;
    while (day > daysInMonth[month])
    {
        day -= daysInMonth[month];
        month++;
    }

    // 返回格式化后的日期字符串
    return `星历3123年${month + 1}月${day}日`;
}
function addtime(isdate=true)
{
    //增加一天
    addmental(30);
    if (!isdate)
    {
        addwater(-30);
        addstamina(-30);
    }
    else
    {
        //约会回满
        addmental(100);
        addwater(100);
        addstamina(100);
    }
    //如果饱腹度没有了
    if (data.stamina == 0)
    {
        if (data.guideLevel == 0)
        {
            showalert("Game Over", "长时间的饥饿令你明白向导可能并不是一个适合你的赛道，你决定转行去做营养液生产工人，从此过上了衣食无忧的生活……");
            gameover(1);
            return;
        }
        else
        {
            showalert("向导中心", "已为您紧急补充了营养液，扣除1点积分");
            addwater(30);
            addstamina(30);
            addscore(-1);
        }
    }
    data.day++;
    if (data.day >= 181)
    {
        showalert("通关", "恭喜你成功的度过了做为向导的实习期！");
        gameover(3);
        return;
    }
    //随机每个人是否出任务
    //连续出任务3天的人增加随机污染值
    //喜欢女主的人送礼
    //喜欢女主的人邀请约会
    //配偶每天给钱
    if (data.par != -1)
    {
        temp = getnpc(data.par);
       
        if (temp != null)
        {
            //d 1-10 c 20-50 b 90-130 a 200-300 s 400-800
            smin = [1, 10, 30, 60, 100,200];
            smax = [10, 20, 50, 80, 150,250];
            num = smin[temp.level] + Math.floor(Math.random() * (smax[temp.level] - smin[temp.level]));
            addscore(num);
            data.dayevent.push([3, num]);
        }
    }
    b1 = false;
    for (const npc of data.npcs)
    {
        if (Math.random() < 0.5)
        {
            npc.inhome = !npc.inhome;
        }
        if (npc.pollution >= 90)
        {
            npc.inhome = true;
        }
        else if (npc.pollution <= 20)
        {
            npc.inhome = false;
        }
        if (npc.inhome)
        {
            npc.leavetime = 0;
            if (data.par == -1 && !b1&&npc.love >= 20 && !npc.hasProposed && Math.random() < 0.1)
            {
                //求婚
                npc.hasProposed = true;
                    data.dayevent.push([0, npc.id]);
                    b1 = true;
            }
        }
        else
        {
                const randomInt = Math.floor(Math.random() * 25);
                addpollution(npc.id, randomInt);
            
        }
    }
    if (!b1)
    {
        //约会一天只会有一个人问
        for (const npc of data.npcs)
        {
            if (npc.inhome)
            {
                if (npc.love > 0 && Math.random() < 0.1 )
                {
                    if (data.par == -1 || data.par == npc.id)
                    {
                        data.dayevent.push([1, npc.id]);
                        break;
                    }
                    else
                    {
                        data.dayevent.push([4, npc.id ]);
                    }
                }
            }
        }
    }
    //送礼
    for (const npc of data.npcs)
    {
        if (npc.inhome)
        {
            if (npc.trust > 70 && Math.random() < 0.1 )
            {
                num = 2 + Math.floor(Math.random() * 3);//2无污染水 3精神补剂 4小零食
                num1 = 0;
                if (npc.id == 10)
                {
                    num = 0;//手制小饼干
                }
                else if (npc.level >= 4)
                {
                    num = 1;//珠宝
                    num1 = 100+Math.floor(Math.random() * 100);
                }

                data.dayevent.push([2, npc.id,num,num1]);
                break;
            }
        }
    }
    data.isdate = false;
    data.dideat = false;
    localStorage.setItem('guideDiaryData', JSON.stringify(data));
    loadpage("main");
    showevents();
}
function getnpc(num)
{
    temp = null;
    for (const tnpc of data.npcs)
    {
        if (tnpc.id == num)
        {
            temp = tnpc;
            break;
        }
    }
    return temp;
}
function marry()
{

        //结婚
        showalert("结婚", `你和${people[tempid].name}去民政中心登记了配偶关系`);
    data.par = tempid;
    data.isdate = true;
        addtime(true);
    
}
function godate()
{
    //约会
    npc = getnpc(tempid);
    if (npc != null)
    {
        npc.datenum++;
        data.isdate = true;
        npc.love +=2;
        if (tempid == 0 || tempid == 7 || tempid == 11)
        {
            showalert("约会", `你和${people[tempid].name}度过了行程排得满满的一天`, addtime);
        }
        else if (tempid == 1 || tempid == 3 || tempid == 6 || tempid == 9 || tempid == 13 || tempid == 14)
        {
            showalert("约会", `你和${people[tempid].name}度过了浪漫的一天`, addtime);
        }
        else if (tempid == 2 || tempid == 4 || tempid == 10)
        {
            showalert("约会", `你和${people[tempid].name}度过了户外旅行的一天`,addtime);
        }
        else
        {
            showalert("约会", `你和${people[tempid].name}度过了足不出户的一天`, addtime);
        }
       
    }
   
}


async function gameover(num)
{
    console.log("gameover");
    //1是饿死2是被袭击3是满时间
    const cardBody = document.querySelector('.card-body');
    cardBody.innerHTML = '';

    //显示后日谈和清空按钮 点击清空按钮后进入newgame
    if (num == 3)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        infoDiv = document.createElement('div');
        //infoDiv.className = 'applicant-info';
        infoDiv.innerHTML = `<div>你在历时半年的向导实习工作中共进行了${data.curenum}次精神疏导</div>`;
        cardBody.appendChild(infoDiv);

    }
    else
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        infoDiv = document.createElement('div');
        //infoDiv.className = 'applicant-info';
        infoDiv.innerHTML = `<div>你在向导的职位上共工作了${data.day}天,共进行了${data.curenum}次精神疏导</div>`;
        cardBody.appendChild(infoDiv);
    }
    num0 = -1;
    num1 = 0;
    for (const npc of data.npcs)
    {
        if (npc.curenum > num1)
        {
            num0 = npc.id;
            num1 = npc.curenum;
        }
    }
    if (num0 != -1)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<div>被你进行过最多次精神疏导的哨兵是${people[num0].race}哨兵${people[num0].name}，你共为他进行了${num1}次精神疏导</div>`;

        // 创建图片元素
        const img = document.createElement('img');
        img.src = "npc" + num0 + ".gif"; // 将图片路径赋值给 src
        img.alt = "npc图像"; // 设置替代文本
        img.style.width = '128px'; // 设定图片宽度为100%
        img.style.height = 'auto'; // 自动调整高度
        img.style.marginLeft = '10px'; // 设置左边距为10像素
        // 将图片添加到容器中
        infoDiv.appendChild(img);
        cardBody.appendChild(infoDiv);
    }
    if (num == 3)
    {
        if (data.guideLevel > 0)
        {
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            infoDiv = document.createElement('div');
            if (data.guideLevel == 4)
            {
                infoDiv.innerHTML = `<div>这半年中你成功的突破为了极为罕见的S级向导，现在的你已经不再是刚刚毕业的菜鸟向导，而是帝国的珍宝</div>`;
            }
            else
            {
                infoDiv.innerHTML = `<div>这半年中你成功的突破为了${getlvs(data.guideLevel)}级向导</div>`;
            }
            cardBody.appendChild(infoDiv);
        }
    }
    tidarr = [];
    arr = [];
    for (const npc of data.npcs)
    {
        if (npc.isEvolution)
        {
            arr.push(npc.id);
        }
        if (npc.level >= 5 && data.killer!=npc.id)
        {
            tidarr.push(npc.id);
        }
    }
    if (arr.length > 0)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        text = "<div>令人震惊的是，在你的净化下，";
        for (const n of arr)
        {
            npc = getnpc(n);
            text += people[n].race+"哨兵"+ people[n].name + "突破为了" + getlvs(npc.level) + "级哨兵，";
        }
        if (num == 3)
        {
            text += "你这神奇的能力引起了国立向导中心研究部门的注意，你很高兴的接住了他们伸来的橄榄枝，在继续向导工作的同时也将作为编内学者进行相关原理的研究</div>";
        }
        else
        {
            text += "你这神奇的能力引起了国立向导中心研究部门的注意，你很高兴的接住了他们伸来的橄榄枝，专职成为了编内学者进行相关原理的研究</div>";
        }
        infoDiv = document.createElement('div');
        infoDiv.innerHTML = text;
        for (const n of arr)
        {
            // 创建图片元素
            const img = document.createElement('img');
            img.src = "npc" + n + ".gif"; // 将图片路径赋值给 src
            img.alt = "npc图像"; // 设置替代文本
            img.style.width = '128px'; // 设定图片宽度为100%
            img.style.height = 'auto'; // 自动调整高度
            img.style.marginLeft = '10px'; // 设置左边距为10像素
            // 将图片添加到容器中
            infoDiv.appendChild(img);
        }
        cardBody.appendChild(infoDiv);
        if (tidarr.length>0 )
        {
           
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            infoDiv = document.createElement('div');
            console.log(tidarr.length);
            if (tidarr.length == 1)
            {
                console.log("a1");
                infoDiv.innerHTML = `<div>宇宙第一位SS级哨兵${people[tidarr[0]].name}的出现令这场绵延千年的战争战局出现了巨大的变化，或许再过不久，大家就能过上不用再打仗的日子了吧。而这一切，都是你的功劳</div>`;
            }
            else
            {
                console.log("a2");
                infoDiv.innerHTML = `<div>宇宙第一批SS级哨兵的出现令这场绵延千年的战争战局出现了巨大的变化，或许再过不久，大家就能过上不用再打仗的日子了吧。而这一切，都是你的功劳</div>`;
            }
            cardBody.appendChild(infoDiv);
        }
    }



    arr = [];
    for (const npc of data.npcs)
    {
        if (npc.love >= 20 && data.killer!=npc.id)
        {
            arr.push(npc.id);
        }
    }
    if (num == 3)
    {
        if (arr.length == 1)
        {
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            infoDiv = document.createElement('div');
            if (data.par == arr[0])
            {
                infoDiv.innerHTML = `<div>在半年的向导实习期结束后，你和你的配偶${people[arr[0]].race}哨兵${people[arr[0]].name}搬到了一起住，你们有了更多独处的时间。而他对你的迷恋似乎永远不会随着时间而减淡。${people[arr[0]].name}一直试图让你成为他的独属向导，但对你来说，用自己的力量尽可能帮助更多人才是最重要的</div>`;
            }
            else
            {
                infoDiv.innerHTML = `<div>在半年的向导实习期结束后，${people[arr[0]].race}哨兵${people[arr[0]].name}向你发出了希望你成为他的独属向导的申请，目前他还在使出浑身解数来向你展示他各方面的优点以冀换取你的同意</div>`;
            }
            // 创建图片元素
            const img = document.createElement('img');
            img.src = "npc" + arr[0] + ".gif"; // 将图片路径赋值给 src
            img.alt = "npc图像"; // 设置替代文本
            img.style.width = '128px'; // 设定图片宽度为100%
            img.style.height = 'auto'; // 自动调整高度
            img.style.marginLeft = '10px'; // 设置左边距为10像素
            // 将图片添加到容器中
            infoDiv.appendChild(img);
            cardBody.appendChild(infoDiv);
        }
        else if (arr.length > 1)
        {
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            text = "<div>在半年的向导实习期结束后，";
            num2 = 0;
            if (data.par != -1 && data.killer!=data.par)
            {
                text += `你和你的配偶${people[data.par].race}哨兵${people[data.par].name}搬到了一起住，他对你的迷恋似乎永远不会随着时间而减淡。你本以为同居后你们会有更多的时间独处，但`;
                for (i = 0; i < arr.length; i++)
                {
                    if (arr[i] != data.par)
                    {
                        num2++;
                        text += people[arr[i]].race + "哨兵" + people[arr[i]].name;
                        if (i == arr.length - 2)
                        {
                            text += "和";
                        }
                        else if (i != arr.length - 1)
                        {
                            text += "，";
                        }
                    }
                }
                text1 = "他";
                if (num2 > 1)
                {
                    text1 = "他们";
                }
                text += "总是会以各种理由出现在你的生活中，" + text1 + "显然还没有放弃给自己争取机会的想法……</div>"
            }
            else
            {
                for (i = 0; i < arr.length; i++)
                {
                    text += people[arr[i]].race + "哨兵" + people[arr[i]].name;
                    if (i == arr.length - 2)
                    {
                        text += "和";
                    }
                    else if (i != arr.length - 1)
                    {
                        text += "，";
                    }
                }

                text += "各自向你发出了希望你成为他的独属向导的申请，在你做出决定前，他们每天都在为谁能占用你更多时间相互较劲竞争着</div>";
            }
            infoDiv = document.createElement('div');
            infoDiv.innerHTML = text;
            if (data.par != -1)
            {
                // 创建图片元素
                const img = document.createElement('img');
                img.src = "npc" + data.par + ".gif"; // 将图片路径赋值给 src
                img.alt = "npc图像"; // 设置替代文本
                img.style.width = '128px'; // 设定图片宽度为100%
                img.style.height = 'auto'; // 自动调整高度
                img.style.marginLeft = '10px'; // 设置左边距为10像素
                // 将图片添加到容器中
                infoDiv.appendChild(img);
            }
            for (const n of arr)
            {
                if (n != data.par)
                {
                    // 创建图片元素
                    const img = document.createElement('img');
                    img.src = "npc" + n + ".gif"; // 将图片路径赋值给 src
                    img.alt = "npc图像"; // 设置替代文本
                    img.style.width = '128px'; // 设定图片宽度为100%
                    img.style.height = 'auto'; // 自动调整高度
                    img.style.marginLeft = '10px'; // 设置左边距为10像素
                    // 将图片添加到容器中
                    infoDiv.appendChild(img);
                }
            }
            cardBody.appendChild(infoDiv);

        }
    }
    else
    {
        if (data.par != -1&&data.killer!=data.par)
        {
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            infoDiv = document.createElement('div');
            infoDiv.innerHTML = `<div>不再担任向导后，你的配偶${people[data.par].race}哨兵${people[data.par].name}对于你有更多时间陪他一事很是开心，甚至在你辞职后的一周里都缠着你没有让你出门</div>`;

            // 创建图片元素
            const img = document.createElement('img');
            img.src = "npc" + data.par + ".gif"; // 将图片路径赋值给 src
            img.alt = "npc图像"; // 设置替代文本
            img.style.width = '128px'; // 设定图片宽度为100%
            img.style.height = 'auto'; // 自动调整高度
            img.style.marginLeft = '10px'; // 设置左边距为10像素
            // 将图片添加到容器中
            infoDiv.appendChild(img);
            cardBody.appendChild(infoDiv);
            arr = arr.filter(num => num !== data.par); 
        }
        if (arr.length > 0)
        {
            const br = document.createElement('br');
            cardBody.appendChild(br);
            await delay(300);
            text = "<div>";
            for (i = 0; i < arr.length; i++)
            {
                if (arr[i] != data.par)
                {
                    text += people[arr[i]].race + "哨兵" + people[arr[i]].name;
                    if (i == arr.length - 2)
                    {
                        text += "和";
                    }
                    else if (i != arr.length - 1)
                    {
                        text += "，";
                    }
                }
            }
            text += "在你不再担任向导后也时常前来拜访你，他们过度的热情导致有些时候你被他们的精神体缠得没有办法，只能躲出去几天来休息一下</div>";
            infoDiv = document.createElement('div');
            infoDiv.innerHTML = text;
            for (const n of arr)
            {
                if (n != data.par)
                {
                    // 创建图片元素
                    const img = document.createElement('img');
                    img.src = "npc" + n + ".gif"; // 将图片路径赋值给 src
                    img.alt = "npc图像"; // 设置替代文本
                    img.style.width = '128px'; // 设定图片宽度为100%
                    img.style.height = 'auto'; // 自动调整高度
                    img.style.marginLeft = '10px'; // 设置左边距为10像素
                    // 将图片添加到容器中
                    infoDiv.appendChild(img);
                }
            }
            cardBody.appendChild(infoDiv);
        }
    }
    arr1 = [];
    for (const npc of data.npcs)
    {
        if (npc.trust == 100)
        {
            arr1.push(npc.id);
        }
    }
    let result = arr1.filter(item => !arr.includes(item));
    result = result.filter(num => num !== data.par);
    result = result.filter(num => num !== data.killer);
    if (result.length > 0)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        text = "<div>";
        for (i = 0; i < result.length; i++)
        {
            text += people[result[i]].race + "哨兵" + people[result[i]].name;
            if (i == result.length - 2)
            {
                text += "和";
            }
            else if (i != result.length - 1)
            {
                text += "，";
            }
        }
        if (num == 3)
        {
            text += "依然维系着你们之间深厚的友情，有你做他们的后盾，他们在前线的战斗也可以更加安心了</div>";
        }
        else
        {
            text += "时时会和你在通讯器上聊天，你们的友谊并没有随着你退出这个行业而减淡</div>";
        }
        infoDiv = document.createElement('div');
        infoDiv.innerHTML = text;
        for (i = 0; i < result.length; i++)
        {
            const n = result[i];
            // 创建图片元素
            const img = document.createElement('img');
            img.src = "npc" + n + ".gif"; // 将图片路径赋值给 src
            img.alt = "npc图像"; // 设置替代文本
            img.style.width = '128px'; // 设定图片宽度为100%
            img.style.height = 'auto'; // 自动调整高度
            img.style.marginLeft = '10px'; // 设置左边距为10像素
            // 将图片添加到容器中
            infoDiv.appendChild(img);
        }
        cardBody.appendChild(infoDiv);
    }
    if (num == 3)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
        infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<div>而结束了实习期的你，也将继续向着了不起的向导这条路上继续大步前进吧</div>`;
        cardBody.appendChild(infoDiv);
    }
    

     if (data.killer != -1)
     {
         const br = document.createElement('br');
         cardBody.appendChild(br);
         await delay(300);
        infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<div>有天晚上，你在深夜中醒来，突然发现床边有一座巨大的黑影笼在你的身上。你不知道那是谁……或者是什么，只能感到对方的视线一寸寸舔过你的身体。许久之后，黑影沉默的离开了，你发现你的枕边有一块流光溢彩的晶石，可能是这位深夜来客为你留下的最后一个礼物</div>`;
        // 创建图片元素
        const img = document.createElement('img');
        img.src = "npc" + data.killer + "_d.gif"; // 将图片路径赋值给 src
        img.alt = "npc图像"; // 设置替代文本
        img.style.width = '128px'; // 设定图片宽度为100%
        img.style.height = 'auto'; // 自动调整高度
        img.style.marginLeft = '10px'; // 设置左边距为10像素
        // 将图片添加到容器中
        infoDiv.appendChild(img);
        cardBody.appendChild(infoDiv);
    }
    if (num != 3)
    {
        const br = document.createElement('br');
        cardBody.appendChild(br);
        await delay(300);
         infoDiv = document.createElement('div');
         infoDiv.innerHTML = `<div>经历过各种各样的事情后，虽然你的向导生涯结束了，但你的人生道路还远未结束，无限的未来依然等待着你的探索</div>`;
         cardBody.appendChild(infoDiv);
    }
    const br = document.createElement('br');
    cardBody.appendChild(br);
    await delay(300);
     Button3 = document.createElement('button');
    Button3.className = 'custom-button';
    Button3.innerHTML = "重新开始";
    Button3.onclick = () =>
    {
        newgame();
    };
    cardBody.appendChild(Button3);
}
   
    

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}
function newgame()
{

    localStorage.removeItem('guideDiaryData');
    data = defaultdata();
    console.log("new game" + data.npcs.length);
    data.npcs.push(createnpc(0, 0, 75, 99));
    data.npcs.push(createnpc(1, 0, 56, 95));
    data.npcs.push(createnpc(2, 0, 39, 93));
    loadpage("setname");
}
