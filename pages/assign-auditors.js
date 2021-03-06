/* pages/enroll-auditor.js */
/* Ethers library for connecting to the Blockchain */ 
import { ethers } from 'ethers'
/* React Componentes used
* useEffect for invoking functions when the components load
* useState for mantaining local state of the Dapp
 */
import { useEffect, useState } from 'react'
/* 
* Axios offers a get method with at least one argument (url) to fetch data.
* the data returned is an array, we map through the array 
* and then get the data we want to display and display it at the appropriate element.
*/
import axios from 'axios'

/* Ethereum provider solution for all Wallets
* Web3Modal is an easy-to-use library to help developers 
* add support for multiple providers in their apps with a simple customizable configuration
*/
import Web3Modal from "web3modal"

/*
* Imports the SmartContracts addresses from configuration file
*/
import {
  auditItemAddress, DAuditaddress, auditEnrollments, auditAssignments
} from '../config'

import AuditItem from '../contracts-json/AuditItem.json'
import DAudit from '../contracts-json/DAudit.json'
import AuditEnrollments from '../contracts-json/AuditEnrollments.json'
import AuditorAssignments from '../contracts-json/AuditAssignments.json'

import {useRouter}  from 'next/router'


export default function AssignAuditors() {

  const router = useRouter()
  const { id } = router.query
  const [AItem, setAItem] = useState([])
  const [EnrollAddr, setEnrollAddr] = useState([])
  const [AssignAddr, setAssignAddr] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const auditItemStatuses = ['Pending','InProgress', 'Passed', 'Failed', 'Cancelled']  

  useEffect(() => {
    loadAuditItems()
  }, [])
  async function loadAuditItems() {

    //const provider = new ethers.providers.JsonRpcProvider()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const auditItemContract = new ethers.Contract(auditItemAddress, AuditItem.abi, provider)
    const DAuditContract = new ethers.Contract(DAuditaddress, DAudit.abi, provider)

    const i = await DAuditContract.fetchAuditByTokenId(id) 
    
    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
      const tokenUri = await auditItemContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let auditFee = ethers.utils.formatUnits(i.auditFee.toString(), 'ether')
      let item = {
        auditFee,
        tokenId: i.tokenId.toNumber(),
        producer: i.producer,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        auditReqs: i.auditorReq,
        auditItemStatus: i.auditItemStatus,
      }
    setAItem(item)
    
    const provider2 = new ethers.providers.Web3Provider(window.ethereum);
    const contract2 = new ethers.Contract(auditEnrollments, AuditEnrollments.abi, provider2)
    const isAuditEnrolled = await contract2.isAuditEnrolled(i.tokenId)

    /* Gets the list of auditors enrrolled, if any */
    if(isAuditEnrolled) {
      let EnrollData1 = await contract2.getAuditEnrollment(id)
      setEnrollAddr(EnrollData1.auditors)  
    }

    /* Gets the list of auditors assigned, if any */
    const provider3 = new ethers.providers.Web3Provider(window.ethereum);
    const contract3 = new ethers.Contract(auditAssignments, AuditorAssignments.abi, provider3)
    const isAuditAssigned = await contract3.isAuditAssigned(i.tokenId)

    if(isAuditAssigned) {
      let AssignData1 = await contract3.getAuditAssignment(id)
      setAssignAddr(AssignData1.auditors)  
    }

    setLoadingState('loaded') 
  }
  async function assignAuditors() {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal3 = new Web3Modal()
    const connection3 = await web3Modal3.connect()
    const provider3 = new ethers.providers.Web3Provider(connection3)
    const signer3 = provider3.getSigner()  
    const contract3 = new ethers.Contract(DAuditaddress, DAudit.abi, signer3)

    /* user will be prompted to pay 0 + gas fees  
    //const signerAddress = await signer3.getAddress();
    */
    
    const transaction3 = await contract3.assignAuditors(id,{value:'0'})

    const trxR = await transaction3.wait()
    
    loadAuditItems()
  }
  
  if (loadingState === 'loaded' && AItem.tokenId === null) 
    return (<h1 className="px-20 py-10 text-3xl">No audits to enroll</h1>)
  return (
    
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                     <div key={AItem.Id} className="border shadow rounded-xl overflow-hidden">
                <img src={AItem.image} className="rounded" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{AItem.name}</p>
                  <p className="text-xl font-italic text-white">{AItem.description}</p>
                </div>
                <div className="p-4 bg-green-400">
                <p className="text-base font-mono font-bold text-white">Audit Fee  : {AItem.auditFee} Eth</p>
                <p className="text-base font-mono font-bold text-white">Auditors required  : {AItem.auditReqs}</p>
                
                    <button className="w-full bg-blue-500 text-white font-bold py-2 px-0 rounded" onClick={() => assignAuditors()}>Assign Auditor</button>
                
                <p className="text-base font-mono font-bold text-white">Producer  : {AItem.producer}</p>


                    <p className="text-base font-mono font-bold text-white">Auditors Enrolled  : </p>
                    {
                    EnrollAddr.map((auditorAddr)=>{
                    return (
                      <p key={auditorAddr} className="text-base font-mono font-bold text-white">{auditorAddr}</p>
                      )
                      })
                    }
                    <p className="text-base font-mono font-bold text-white">Auditors Assigned  : </p>
                    {
                    AssignAddr.map((auditorAddr)=>{
                    return (
                      <p key={auditorAddr} className="text-base font-mono font-bold text-white">{auditorAddr}</p>
                      )
                      })
                    }
                </div>
              </div>
        </div>
      </div>
    </div>


      )
}