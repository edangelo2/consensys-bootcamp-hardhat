/* pages/index.js */
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
import Link from 'next/link';

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

import AuditItem from '../artifacts/contracts/AuditItem.sol/AuditItem.json'
import DAudit from '../artifacts/contracts/DAudit.sol/DAudit.json'
import AuditEnrollments from '../artifacts/contracts/AuditorEnrollments.sol/AuditEnrollments.json'
import AuditAssignments from '../artifacts/contracts/AuditorAssignments.sol/AuditAssignments.json'
import AuditResult from '../artifacts/contracts/AuditResult.sol/AuditResult.json'

export default function Home() {
  const auditItemStatuses = ['Pending','In Progress', 'Passed', 'Failed', 'Cancelled']  
  const auditResultPaid = ['Pending','Paid','Cancelled']  
  const auditResultOutcome = ['Passed','Failed']  

  const [AuditItems, setAuditItems] = useState([])
  const [AuditorEnrollments, setAuditorEnrollments] = useState([])
  const [AuditorAssignments, setAuditorAssignments] = useState([])
  const [AuditResults, setAuditResults] = useState([])  
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadAuditItems()
  }, [])
  async function loadAuditItems() {
    /* create a generic provider and query for pending audit items */
    const provider = new ethers.providers.JsonRpcProvider()
    const auditItemContract = new ethers.Contract(auditItemAddress, AuditItem.abi, provider)
    const DAuditContract = new ethers.Contract(DAuditaddress, DAudit.abi, provider)
    const data = await DAuditContract.fetchAudits()
    
    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
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
      return item
    }))
    setAuditItems(items)


    const provider2 = new ethers.providers.JsonRpcProvider()
    const contract2 = new ethers.Contract(auditEnrollments, AuditEnrollments.abi, provider2)
    let enrollmentData = await contract2.fetchAuditEnrollments()
    
    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const enrollments = await Promise.all(enrollmentData.map(async i => {

      let enrollment = {
        auditId: i.auditId.toNumber(),
        auditors: i.auditors
      }
      console.log(enrollment)
      return enrollment
    }))
    setAuditorEnrollments(enrollments)
    console.log(enrollments)

    const provider3 = new ethers.providers.JsonRpcProvider()
    const contract3 = new ethers.Contract(auditAssignments, AuditAssignments.abi, provider3)
    let assignmentData = await contract3.fetchAuditAssignments()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const assignments = await Promise.all(assignmentData.map(async i => {
    let assignment = {
        auditId: i.auditId.toNumber(),
        auditors: i.auditors,
        auditResultIds: i.auditResultIds,
        auditorFees: i.auditorFees       ,
        auditorFeePaid: i.auditorFeePaid,
        auditorResults: i.auditorResults
      }
      console.log(assignment)
      return assignment
    }))
    setAuditorAssignments(assignments)
    console.log(assignments)



   
    setLoadingState('loaded') 
  }

  if (loadingState === 'loaded' && !AuditItems.length) return (<h1 className="px-20 py-10 text-3xl">No items submitted for audits</h1>)
  return (
  <div className="flex flex-col ">
    <div className="px-1 py-1 text-left text-xxl font-medium text-gray-500 uppercase tracking-wider">AUDIT ITEMS</div>
    <div className="-my-2 overflow-x-auto sm:-mx-8 lg:-mx-8 ">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Audit ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fee
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Auditors Req
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {
                    AuditItems.map(
                        (AuditItem, i) => 
                            (
                            <tr key={AuditItem.tokenId}>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">{AuditItem.tokenId}</td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{AuditItem.name}</div>
                                        <div className="text-xs font-thin text-black-900">Producer: {AuditItem.producer}</div>
                                    </div>
                                    </div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{AuditItem.description}</div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{AuditItem.auditFee}</div>
                                </td>                                
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{AuditItem.auditReqs}</div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <span className="px-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {auditItemStatuses[AuditItem.auditItemStatus]}
                                    </span>
                                </td>
                            </tr>
                        )
                    )
                }
            </tbody>
            
            </table>
        </div>
        </div>
    </div>

    <div className="px-1 py-1 text-left text-xxl font-medium text-gray-500 uppercase tracking-wider">AUDIT ENRROLMENTS</div>
    <div className="-my-2 overflow-x-auto sm:-mx-8 lg:-mx-8 ">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Audit ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Auditors
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {
                    AuditorEnrollments.map(
                        (AuditEnrollment, i) => 
                            (
                            <tr key={AuditEnrollment.auditId}>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">{AuditEnrollment.auditId}</td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                        {
                                          AuditEnrollment.auditors.map((auditorAddr)=>{
                                          return (
                                            <p key={auditorAddr} className="text-xs font-thin text-black-900">{auditorAddr}</p>
                                            )
                                            })
                                        }
                                        </div>
                                    </div>
                                    </div>
                                </td>
                            </tr>
                        )
                    )
                }
            </tbody>
            </table>
        </div>
        </div>

    </div>






    <div className="px-1 py-1 text-left text-xxl font-medium text-gray-500 uppercase tracking-wider">AUDIT RESULTS</div>
    <div className="-my-2 overflow-x-auto sm:-mx-8 lg:-mx-8 ">
      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-1 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Audit ID
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Auditors
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fees
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pay Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Results
                </th>                                                                
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {
                    AuditorAssignments.map(
                        (AAssignments, i) => 
                            (
                            <tr key={AAssignments.auditId}>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">{AAssignments.auditId}</td>
                                <td className="px-1 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                          {
                                            AAssignments.auditors.map((auditorAddr)=>{
                                            return (
                                              <p className="text-xs font-thin text-black-900">{auditorAddr}</p>
                                              )
                                              })
                                          }
                                          </div>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                      <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                          {
                                            AAssignments.auditorFees.map((AFee)=>{
                                            return (
                                              <p className="text-xs font-thin text-black-900">{ethers.utils.formatUnits(AFee.toString(), 'ether')}</p>
                                              )
                                              })
                                          }
                                          </div>
                                      </div>
                                    </div>
                                 </td>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {
                                             AAssignments.auditorFeePaid.map((auditorFP)=>{
                                            return (
                                              <p className="text-xs font-thin text-black-900">{auditorFP ? 'Paid': 'Pending'}</p>
                                              )
                                              })
                                          }
                                      </div>
                                    </div>
                                   </div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">                                      
                                  <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                          {
                                            AAssignments.auditResultIds.map((auditRId)=>{
                                            return (
                                              <p className="text-xs font-thin text-black-900">{auditRId.toString()}</p>
                                              )
                                              })
                                          }
                                          </div>
                                    </div>
                                   </div>
                                </td>
                                <td className="px-1 py-1 whitespace-nowrap text-sm text-gray-500">                                      
                                  <div className="flex items-center">
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                  
                                          {
                                            AAssignments.auditorResults.map((auditR)=>{
                                            return (
                                              <p className="text-xs font-thin text-black-900">{auditR ? 'Passed': 'Failed'}</p>
                                              )
                                              })
                                          }
                                          </div>
                                    </div>
                                   </div>
                                </td>
                             </tr>
                        )
                    )
                }
            </tbody>
            </table>
        </div>
        </div>
    </div>
    



  </div>

    
  )
}
  