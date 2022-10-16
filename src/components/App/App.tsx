import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
import treePackage from 'relatives-tree/package.json';
import ReactFamilyTree from 'react-family-tree';
import { PinchZoomPan } from '../PinchZoomPan/PinchZoomPan';
import { FamilyNode } from '../FamilyNode/FamilyNode';
import { NodeDetails } from '../NodeDetails/NodeDetails';
import { NODE_WIDTH, NODE_HEIGHT, SOURCES, DEFAULT_SOURCE } from '../const';
import axios from 'axios';
import { getNodeStyle } from './utils';
import { BACKEND_ORIGIN } from '../../config';
import { stateCodes } from "./constants"

import css from './App.module.css';

export default React.memo(
  function App() {
    const [source, setSource] = useState(DEFAULT_SOURCE);
    const [nodes, setNodes] = useState(SOURCES['tree']);

    const firstNodeId = useMemo(() => nodes[0].id, [nodes]);
    const [rootId, setRootId] = useState(firstNodeId);

    const [selectId, setSelectId] = useState<string>();
    const [hoverId, setHoverId] = useState<string>();

    const resetRootHandler = useCallback(() => setRootId(firstNodeId), [firstNodeId]);

    const [IsResuts,setIsResuts]=useState(false);
    const [IsCaptcha,setIsCaptcha] = useState(false);

    const changeSourceHandler = useCallback(
      (value: string, nodes: readonly Readonly<Node>[]) => {
        setRootId(nodes[0].id);
        setNodes(nodes);
        setSource(value);
        setSelectId(undefined);
        setHoverId(undefined);
      },
      [],
    );

    const selected = useMemo(() => (
      nodes.find((item:any) => item.id === selectId)
    ), [nodes, selectId]);
    const [form,setForm] = useState({
      name: "",
      fname: "",
      year: "",
      month: "",
      day: "",
      ac:"",
      gender:"",
      state: "",
      district:"",
      voter_id: "",
  });

  const [captchaImage,setCaptchaImage] = useState("");
  const [userCaptcha,setUserCaptcha] = useState();
  const [districts, setDistricts] = useState([{ dist_no: "-1", dist_name: "Select District", ST_CODE: "-1" }])
  const [acs, setAcs] = useState([
    {
      "ac_no": "-1",
      "ac_name": "Select AC",
      "ST_CODE": "-1",
      "DIST_NO": "-1"
    }
  ])
  const [currDist, setCurrDist] = useState("-1")
  const [currState, setCurrState] = useState("-1")
  useEffect(()=>{
    axios.post(`${BACKEND_ORIGIN}/electoral/getDists/?state_code=${currState}`)
    .then(res => setDistricts(JSON.parse(res.data)))
  },[currState])
  useEffect(() => {
    axios.post(`${BACKEND_ORIGIN}/electoral/getACS/?state_code=${currState}&dist_no=${currDist}`)
    .then(res => setAcs(JSON.parse(res.data)))
  },[currDist])
  const onChange = (e: any, field: any) => {
    if(field==="state"){
      //@ts-ignore next-line
      setCurrState(stateCodes[e.target.value])
      setForm({...form, [field]: e.target.value})
    }
    if(field==="district"){
      const data = e.target.value.split(",")
      setCurrDist(data[1])
      console.log(data[1])
      setForm({...form, [field]: data[0]})
    }
    else setForm({...form, [field]: e.target.value})
  }  
  const onChangeCaptcha = (e:any)=>{
    setUserCaptcha(e.target.value)
  }

  const handleCaptcha = (e:any,field:any) =>{
       e.preventDefault()
       axios.post(`${BACKEND_ORIGIN}/electoral/code/?code=${userCaptcha}`)
       .then((res:any) =>{
        setNodes({...nodes,[field]:res.data})
        setIsCaptcha(!IsCaptcha);
       })
       .catch((e:any) =>  {
        alert("Invalid Captcha")
        window.location.reload()})
  } 
  const onSubmit =(e: any) => {
      e.preventDefault();
      console.log(form)
      axios.post(`${BACKEND_ORIGIN}/electoral/details/`, form)
      .then((res: any) => {
        setCaptchaImage(res.data)
        setIsResuts(!IsResuts)
      })
      .catch((e : any) => console.log(e))
  }

   return (
      <div className={css.root}>
        <header className={css.header}>
          <h1 className={css.title}>
            FamilyTree 
          </h1>
        </header>
          {!IsResuts && <form className={css.mainFormContainer}>
          <div className={css.mainForm}>
              <input
                  name='name'
                  id='name'
                  type='name'
                  placeholder='Name'
                  onChange={(e)=>onChange(e, 'name')}
                  required
                  />
                  <input
                  name='voter_id'
                  id='voter_id'
                  type='voter_id'
                  placeholder="Voter ID"
                  onChange={(e)=>onChange(e, 'voter_id')}
                  required
                  />
              <input
                  name='year'
                  id='year'
                  type='year'
                  placeholder='Year of Birth'
                  onChange={(e)=>onChange(e, 'year')}
                  required
                  />
                  <select
                  name='month'
                  id='month'
                  onChange={(e)=>onChange(e, 'month')}
                  required
                  >
                  <option>Month of Birth</option>
                  <option value="Jan">January</option>
                  <option value="Feb">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="Jun">June</option>
                  <option value="July">July</option>
                  <option value="Aug">August</option>
                  <option value="Sep">September</option>
                  <option value="Oct">October</option>
                  <option value="Nov">November</option>
                  <option value="Dec">December</option>
                </select>
                  <input
                  name='day'
                  id='day'
                  type='day'
                  placeholder='Day of Birth'
                  onChange={(e)=>onChange(e, 'day')}
                  required
                  />
                <input
                  name='fname'
                  id='fname'
                  type='fname'
                  placeholder="Father/Husband's name"
                  onChange={(e)=>onChange(e, 'fname')}
                  required
                  />
                <select
                  name='gender'
                  id='gender'
                  onChange={(e)=>onChange(e, 'gender')}
                  required
                  >
                  <option>Select Gender</option>
                  <option value="पुरुष/Male">Male</option>
                  <option value="स्त्री/Female">Female</option>
                  <option value="अन्य/Others">Others</option>
                </select>
              <select
                  name='state'
                  id='state'
                  onChange={(e)=>onChange(e, 'state')}
                  required
                  >
                  <option>Select State</option>
                  <option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Andaman &amp; Nicobar Islands" className="ng-binding ng-scope">Andaman &amp; Nicobar Islands</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Andhra Pradesh" className="ng-binding ng-scope">Andhra Pradesh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Arunachal Pradesh" className="ng-binding ng-scope">Arunachal Pradesh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Assam" className="ng-binding ng-scope">Assam</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Bihar" className="ng-binding ng-scope">Bihar</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Chandigarh<" className="ng-binding ng-scope">Chandigarh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Chattisgarh" className="ng-binding ng-scope">Chattisgarh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Dadra &amp; Nagar Haveli and Daman &amp; Diu" className="ng-binding ng-scope">Dadra &amp; Nagar Haveli and Daman &amp; Diu</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Goa" className="ng-binding ng-scope">Goa</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Gujarat" className="ng-binding ng-scope">Gujarat</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Haryana" className="ng-binding ng-scope">Haryana</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Himachal Pradesh" className="ng-binding ng-scope">Himachal Pradesh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Jammu and Kashmir" className="ng-binding ng-scope">Jammu and Kashmir</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Jharkhand" className="ng-binding ng-scope">Jharkhand</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Karnataka" className="ng-binding ng-scope">Karnataka</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Kerala" className="ng-binding ng-scope">Kerala</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Ladakh" className="ng-binding ng-scope">Ladakh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Lakshadweep" className="ng-binding ng-scope">Lakshadweep</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Madhya Pradesh" className="ng-binding ng-scope">Madhya Pradesh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Maharashtra" className="ng-binding ng-scope">Maharashtra</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Manipur" className="ng-binding ng-scope">Manipur</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Meghalaya" className="ng-binding ng-scope">Meghalaya</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Mizoram" className="ng-binding ng-scope">Mizoram</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Nagaland" className="ng-binding ng-scope">Nagaland</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="NCT OF Delhi" className="ng-binding ng-scope">NCT OF Delhi</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Odisha" className="ng-binding ng-scope">Odisha</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Puducherry" className="ng-binding ng-scope">Puducherry</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Punjab" className="ng-binding ng-scope">Punjab</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Rajasthan" className="ng-binding ng-scope">Rajasthan</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Sikkim" className="ng-binding ng-scope">Sikkim</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Tamil Nadu" className="ng-binding ng-scope">Tamil Nadu</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Telangana" className="ng-binding ng-scope">Telangana</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Tripura" className="ng-binding ng-scope">Tripura</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Uttar Pradesh" className="ng-binding ng-scope">Uttar Pradesh</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="Uttarakhand" className="ng-binding ng-scope">Uttarakhand</option><option data-ng-repeat="t in statedata| orderBy:'state_name'" value="West Bengal" className="ng-binding ng-scope">West Bengal</option>
                  
              </select>
              <select
                  name='district'
                  id='district'
                  onChange={(e)=>onChange(e, 'district')}
                  required
                  >
                  {districts.length > 0 ? districts.map((district) =>
                  <option key={district.dist_no} value={[district.dist_name, district.dist_no]}>{district.dist_name}</option>)
                  : <option>Select District</option>}
              </select>
              <select
                  name='ac'
                  id='ac'
                  onChange={(e)=>onChange(e, 'ac')}
                  required
                  >
                  {acs.length > 0 ? acs.map((ac) =>
                  <option key={ac.ac_no} value={ac.ac_name}>{ac.ac_name}</option>)
                : <option>Select AC</option>}
              </select>
              <button onClick={(e) => onSubmit(e)}>Submit</button>
          </div>
          </form>}
          {IsResuts && <div className={css.mainFormContainer}><div className={css.mainForm}><img src={`data:image/png;base64,${captchaImage}`} alt="Captcha image" width="70px"/>
          <input
                  name='captcha'
                  id='captcha'
                  type='name'
                  placeholder='Enter Captcha'
                  onChange={(e)=>onChangeCaptcha(e)}
                  required
                  />
          <button onClick={(e)=>handleCaptcha(e,'tree')}>Check Captcha</button></div></div>}
          {IsCaptcha && nodes.length > 0 && (
            <PinchZoomPan min={0.5} max={2.5} captureWheel className={css.wrapper}>
              <ReactFamilyTree
                nodes={nodes}
                rootId={rootId}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                className={css.tree}
                renderNode={(node: Readonly<ExtNode>) => (
                  <FamilyNode
                    key={node.id}
                    node={node}
                    isRoot={node.id === rootId}
                    isHover={node.id === hoverId}
                    onClick={setSelectId}
                    onSubClick={setRootId}
                    style={getNodeStyle(node)}
                  />
                )}
              />
            </PinchZoomPan>
          )}
          {rootId !== firstNodeId && (
            <button className={css.reset} onClick={resetRootHandler}>
              Reset
            </button>
          )}
          {selected && (
            <NodeDetails
              node={selected}
              className={css.details}
              onSelect={setSelectId}
              onHover={setHoverId}
              onClear={() => setHoverId(undefined)}
            />
          )}
        
        
      </div>
    );
  },
);
