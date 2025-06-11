import mongoose from 'mongoose';

const CheckListSchema = new mongoose.Schema({
    controlItem: {
        type: String,
        required: true
    },
    controlObjective: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Planning & Initiation',
            'Tender Advertisement & Opening',
            'Responsiveness & Eligibility',
            'Functionality Evaluation',
            'Financial & Preference Evaluation',
            'Committee Evaluation & Approvals',
            'Award & Contracting',
            'Post-Award & Compliance'
        ]
    }
});

// Predefined checklist items
const predefinedChecklistItems = [
    // 1. Planning & Initiation
    {
        controlItem: 'Needs Assessment',
        controlObjective: 'Verify that a documented and approved needs analysis exists and is linked to user requirements and budget.',
        category: 'Planning & Initiation'
    },
    {
        controlItem: 'Approved Procurement Plan',
        controlObjective: 'Ensure the procurement is listed on the approved Procurement Plan in line with Treasury and SCM Policy Clause 8.2.',
        category: 'Planning & Initiation'
    },
    {
        controlItem: 'Confirmation of Budget',
        controlObjective: 'Confirm that budget availability and internal funding approval exist prior to advertising the tender, per PFMA Section 38(1)(c)(ii).',
        category: 'Planning & Initiation'
    },
    {
        controlItem: 'BSC Approval',
        controlObjective: 'Verify that the BSC formally approved the tender specification and procurement method prior to advertisement.',
        category: 'Planning & Initiation'
    },
    {
        controlItem: 'Feasibility Study',
        controlObjective: 'Confirm that a feasibility or technical study was completed for high-value or complex procurements as per Demand Management Procedure.',
        category: 'Planning & Initiation'
    },
    {
        controlItem: 'Planning & Initiation Complaince',
        controlObjective: 'Compliance feedback for Planning & Initiation Complaince',
        category: 'Planning & Initiation'
    },

    // 2. Tender Advertisement & Opening
    {
        controlItem: 'Tender Advertisement',
        controlObjective: 'Ensure tender was advertised publicly (eTender, CIDB, etc.) in accordance with SCM Policy Clause 8.5 and Section 217 of the Constitution.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Advertisement Period',
        controlObjective: 'Verify the tender remained advertised for the minimum period of 21 days as per SCM and National Treasury regulations.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Addenda and Clarifications',
        controlObjective: 'Confirm all addenda issued during tender stage were acknowledged in writing by bidders to ensure equal treatment.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Bid Closing Register',
        controlObjective: 'Ensure a signed bid opening register was completed, capturing bidder names, submission times, and signatories.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Bid Submission Files',
        controlObjective: 'Confirm all submissions include full documentation as per T2.1 List of Returnables.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Transfer Lists & Tender Registers',
        controlObjective: 'Ensure tender tracking and transfer logs were updated at each phase and match SCM records.',
        category: 'Tender Advertisement & Opening'
    },
    {
        controlItem: 'Tender Advertisement & Opening Complaince',
        controlObjective: 'Compliance feedback for Tender Advertisement & Opening',
        category: 'Tender Advertisement & Opening'
    },

    // 3. Responsiveness & Eligibility
    {
        controlItem: 'Responsiveness Screening',
        controlObjective: 'Check that responsiveness was assessed using a signed checklist and aligned to the published evaluation criteria.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'CSD & SARS Compliance',
        controlObjective: 'Verify each bidder\'s CSD status and SARS tax clearance pin were valid at the time of responsiveness screening.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'CIDB Grading Verification',
        controlObjective: 'Ensure all responsive bidders possess required CIDB 9CE grading or higher in line with the tender requirements.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'SBD Forms',
        controlObjective: 'Confirm that all required SBD forms (4, 6.1, 8, 9) were submitted, completed, and signed.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'Conflict of Interest Declarations (SBD 4)',
        controlObjective: 'Confirm all evaluation committee members and bidders submitted SBD 4 with no conflicts or proper disclosure.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'Subcontractor Verification',
        controlObjective: 'Ensure that any listed subcontractors were CSD registered and submitted valid BBBEE certificates.',
        category: 'Responsiveness & Eligibility'
    },
    {
        controlItem: 'Responsiveness & Eligibility Complaince',
        controlObjective: 'Compliance feedback for Responsiveness & Eligibility',
        category: 'Responsiveness & Eligibility'
    },

    // 4. Functionality Evaluation
    {
        controlItem: 'Functionality Evaluation Criteria',
        controlObjective: 'Ensure evaluation panel used only published functionality criteria, weights, and scoring as per Tender T1.3.2.',
        category: 'Functionality Evaluation'
    },
    {
        controlItem: 'Minimum 70% Threshold',
        controlObjective: 'Confirm that only bidders with functionality scores ≥70% were allowed to proceed to the financial stage.',
        category: 'Functionality Evaluation'
    },
    {
        controlItem: 'Advancement to Financial Evaluation',
        controlObjective: 'Ensure non-compliant bids (functionality <70%) were eliminated and not financially evaluated.',
        category: 'Functionality Evaluation'
    },
    {
        controlItem: 'Functionality Evaluation Complaince',
        controlObjective: 'Compliance feedback for Functionality Evaluation',
        category: 'Functionality Evaluation'
    },

    // 5. Financial & Preference Evaluation
    {
        controlItem: 'Preference Point System',
        controlObjective: 'Confirm that the correct PPPFA point system (90/10) or (80/20) was applied consistently with accurate score calculation.',
        category: 'Financial & Preference Evaluation'
    },
    {
        controlItem: 'Pricing Analysis',
        controlObjective: 'Verify arithmetic calculations and pricing for errors and abnormality thresholds (±25% of average).',
        category: 'Financial & Preference Evaluation'
    },
    {
        controlItem: 'Valid BBBEE Certificates',
        controlObjective: 'Ensure preference points were only awarded for valid, original/certified BBBEE certificates.',
        category: 'Financial & Preference Evaluation'
    },
    {
        controlItem: 'Check for Abnormally Low/High Pricing',
        controlObjective: 'Check if any pricing appeared abnormally low or high and whether clarifications were obtained.',
        category: 'Financial & Preference Evaluation'
    },
    {
        controlItem: 'Financial & Preference Evaluation Complaince',
        controlObjective: 'Compliance feedback for Financial & Preference Evaluation',
        category: 'Financial & Preference Evaluation'
    },

    // 6. Committee Evaluation & Approvals
    {
        controlItem: 'BEC Deliberation Records',
        controlObjective: 'Ensure BEC deliberations, scoring sheets, and recommendations are formally documented and signed.',
        category: 'Committee Evaluation & Approvals'
    },
    {
        controlItem: 'BAC Approval Records',
        controlObjective: 'Confirm BAC reviewed and approved BEC recommendations without irregular deviation.',
        category: 'Committee Evaluation & Approvals'
    },
    {
        controlItem: 'Committee Appointments',
        controlObjective: 'Verify formal appointment letters exist for all evaluation and adjudication committee members.',
        category: 'Committee Evaluation & Approvals'
    },
    {
        controlItem: 'Blacklisting Verification',
        controlObjective: 'Check whether blacklisting status was verified through National Treasury database and CSD.',
        category: 'Committee Evaluation & Approvals'
    },
    {
        controlItem: 'Internal Audit Review',
        controlObjective: 'If applicable, confirm SCM/Internal Audit review was performed before final BAC decision.',
        category: 'Committee Evaluation & Approvals'
    },
    {
        controlItem: 'Committee Evaluation & Approvals Complaince',
        controlObjective: 'Compliance feedback for Committee Evaluation & Approvals',
        category: 'Committee Evaluation & Approvals'
    },

    // 7. Award & Contracting
    {
        controlItem: 'Award Letter Timing',
        controlObjective: 'Ensure the Letter of Award was issued before the expiry of the bid validity period (SCM Clause 8.10).',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'Form of Tender Acceptance',
        controlObjective: 'Confirm a signed Form of Acceptance was received from the successful bidder.',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'Signed Contract',
        controlObjective: 'Ensure that the final contract was signed by both parties and matched the award value and scope.',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'Filing of Contract Documents',
        controlObjective: 'Check that the complete contract file is organized and stored according to Rand Water\'s filing system.',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'CSD Status at PO',
        controlObjective: 'Confirm the awarded supplier\'s CSD status was still active at the time of PO creation.',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'Tax Clearance at Award Date',
        controlObjective: 'Verify that SARS tax compliance was active and unchanged at date of award.',
        category: 'Award & Contracting'
    },
    {
        controlItem: 'Award & Contracting Complaince',
        controlObjective: 'Compliance feedback for Award & Contracting',
        category: 'Award & Contracting'
    },

    // 8. Post-Award & Compliance
    {
        controlItem: 'Due Diligence Performed',
        controlObjective: 'Ensure a formal due diligence (incl. financial & site) was performed for the preferred bidder.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Purchase Orders Issued',
        controlObjective: 'Confirm that the purchase order issued post-award matches the contract value and vendor.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Subcontractor CIDB Grading',
        controlObjective: 'If subcontracting exists, confirm CIDB grading of subcontractors meets scope requirements.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Form of Offer vs Award Amount',
        controlObjective: 'Check for inconsistencies between signed Form of Offer and awarded contract/PO values.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Reporting & Filing Compliance',
        controlObjective: 'Ensure SCM and procurement records are correctly filed and reported per RW PROC 00180.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Performance Monitoring Setup',
        controlObjective: 'Confirm post-award performance monitoring framework is in place for tracking deliverables.',
        category: 'Post-Award & Compliance'
    },
    {
        controlItem: 'Post-Award & Compliance',
        controlObjective: 'Compliance feedback for Post-Award & Compliance',
        category: 'Post-Award & Compliance'
    }
];

CheckListSchema.statics.initializeChecklist = async function () {
    const count = await this.countDocuments();
    if (count === 0) {
        await this.insertMany(predefinedChecklistItems);
        console.log('Checklist items initialized');
    }
};

const CheckList = mongoose.models.CheckList || mongoose.model('CheckList', CheckListSchema);

CheckList.initializeChecklist().catch(err => {
    console.error('Failed to initialize checklist items:', err);
});

export default CheckList;