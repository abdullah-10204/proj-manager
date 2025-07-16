import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    name: String,
    url: String,
    path: String,
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const SubfolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    files: [FileSchema]
}, { _id: true });

const FolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subfolders: [SubfolderSchema],
    files: [FileSchema]
}, { _id: true });

const ChecklistItemSchema = new mongoose.Schema({
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
}, { _id: true });

const ProjectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
    },
    projectStatus: {
        type: String,
        required: false,
        default: "Mobilised"
    },
    assignedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    folders: [FolderSchema],
    checklist: [ChecklistItemSchema]
}, { timestamps: true });

const predefinedChecklistItems = [
    {
        controlItem: 'Needs Assessment',
        controlObjective: 'Verify that a documented and approved needs analysis exists and is linked to user requirements and budget.',
    },
    {
        controlItem: 'Approved Procurement Plan',
        controlObjective: 'Ensure the procurement is listed on the approved Procurement Plan in line with Treasury and SCM Policy Clause 8.2.',
    },
    {
        controlItem: 'Confirmation of Budget',
        controlObjective: 'Confirm that budget availability and internal funding approval exist prior to advertising the tender, per PFMA Section 38(1)(c)(ii).',
    },
    {
        controlItem: 'BSC Approval',
        controlObjective: 'Verify that the BSC formally approved the tender specification and procurement method prior to advertisement.',
    },
    {
        controlItem: 'Feasibility Study',
        controlObjective: 'Confirm that a feasibility or technical study was completed for high-value or complex procurements as per Demand Management Procedure.',
    },
    {
        controlItem: 'Planning & Initiation Complaince',
        controlObjective: 'Compliance feedback for Planning & Initiation Complaince',
    },

    {
        controlItem: 'Tender Advertisement',
        controlObjective: 'Ensure tender was advertised publicly (eTender, CIDB, etc.) in accordance with SCM Policy Clause 8.5 and Section 217 of the Constitution.',
    },
    {
        controlItem: 'Advertisement Period',
        controlObjective: 'Verify the tender remained advertised for the minimum period of 21 days as per SCM and National Treasury regulations.',
    },
    {
        controlItem: 'Addenda and Clarifications',
        controlObjective: 'Confirm all addenda issued during tender stage were acknowledged in writing by bidders to ensure equal treatment.',
    },
    {
        controlItem: 'Bid Closing Register',
        controlObjective: 'Ensure a signed bid opening register was completed, capturing bidder names, submission times, and signatories.',
    },
    {
        controlItem: 'Bid Submission Files',
        controlObjective: 'Confirm all submissions include full documentation as per T2.1 List of Returnables.',
    },
    {
        controlItem: 'Transfer Lists & Tender Registers',
        controlObjective: 'Ensure tender tracking and transfer logs were updated at each phase and match SCM records.',
    },
    {
        controlItem: 'Tender Advertisement & Opening Complaince',
        controlObjective: 'Compliance feedback for Tender Advertisement & Opening',
    },

    {
        controlItem: 'Responsiveness Screening',
        controlObjective: 'Check that responsiveness was assessed using a signed checklist and aligned to the published evaluation criteria.',
    },
    {
        controlItem: 'CSD & SARS Compliance',
        controlObjective: 'Verify each bidder\'s CSD status and SARS tax clearance pin were valid at the time of responsiveness screening.',
    },
    {
        controlItem: 'CIDB Grading Verification',
        controlObjective: 'Ensure all responsive bidders possess required CIDB 9CE grading or higher in line with the tender requirements.',
    },
    {
        controlItem: 'SBD Forms',
        controlObjective: 'Confirm that all required SBD forms (4, 6.1, 8, 9) were submitted, completed, and signed.',
    },
    {
        controlItem: 'Conflict of Interest Declarations (SBD 4)',
        controlObjective: 'Confirm all evaluation committee members and bidders submitted SBD 4 with no conflicts or proper disclosure.',
    },
    {
        controlItem: 'Subcontractor Verification',
        controlObjective: 'Ensure that any listed subcontractors were CSD registered and submitted valid BBBEE certificates.',
    },
    {
        controlItem: 'Responsiveness & Eligibility Complaince',
        controlObjective: 'Compliance feedback for Responsiveness & Eligibility',
    },

    {
        controlItem: 'Functionality Evaluation Criteria',
        controlObjective: 'Ensure evaluation panel used only published functionality criteria, weights, and scoring as per Tender T1.3.2.',
    },
    {
        controlItem: 'Minimum 70% Threshold',
        controlObjective: 'Confirm that only bidders with functionality scores ≥70% were allowed to proceed to the financial stage.',
    },
    {
        controlItem: 'Advancement to Financial Evaluation',
        controlObjective: 'Ensure non-compliant bids (functionality <70%) were eliminated and not financially evaluated.',
    },
    {
        controlItem: 'Functionality Evaluation Complaince',
        controlObjective: 'Compliance feedback for Functionality Evaluation',
    },

    {
        controlItem: 'Preference Point System',
        controlObjective: 'Confirm that the correct PPPFA point system (90/10) or (80/20) was applied consistently with accurate score calculation.',
    },
    {
        controlItem: 'Pricing Analysis',
        controlObjective: 'Verify arithmetic calculations and pricing for errors and abnormality thresholds (±25% of average).',
    },
    {
        controlItem: 'Valid BBBEE Certificates',
        controlObjective: 'Ensure preference points were only awarded for valid, original/certified BBBEE certificates.',
    },
    {
        controlItem: 'Check for Abnormally Low/High Pricing',
        controlObjective: 'Check if any pricing appeared abnormally low or high and whether clarifications were obtained.',
    },
    {
        controlItem: 'Financial & Preference Evaluation Complaince',
        controlObjective: 'Compliance feedback for Financial & Preference Evaluation',
    },

    {
        controlItem: 'BEC Deliberation Records',
        controlObjective: 'Ensure BEC deliberations, scoring sheets, and recommendations are formally documented and signed.',
    },
    {
        controlItem: 'BAC Approval Records',
        controlObjective: 'Confirm BAC reviewed and approved BEC recommendations without irregular deviation.',
    },
    {
        controlItem: 'Committee Appointments',
        controlObjective: 'Verify formal appointment letters exist for all evaluation and adjudication committee members.',
    },
    {
        controlItem: 'Blacklisting Verification',
        controlObjective: 'Check whether blacklisting status was verified through National Treasury database and CSD.',
    },
    {
        controlItem: 'Internal Audit Review',
        controlObjective: 'If applicable, confirm SCM/Internal Audit review was performed before final BAC decision.',
    },
    {
        controlItem: 'Committee Evaluation & Approvals Complaince',
        controlObjective: 'Compliance feedback for Committee Evaluation & Approvals',
    },

    {
        controlItem: 'Award Letter Timing',
        controlObjective: 'Ensure the Letter of Award was issued before the expiry of the bid validity period (SCM Clause 8.10).',
    },
    {
        controlItem: 'Form of Tender Acceptance',
        controlObjective: 'Confirm a signed Form of Acceptance was received from the successful bidder.',
    },
    {
        controlItem: 'Signed Contract',
        controlObjective: 'Ensure that the final contract was signed by both parties and matched the award value and scope.',
    },
    {
        controlItem: 'Filing of Contract Documents',
        controlObjective: 'Check that the complete contract file is organized and stored according to Rand Water\'s filing system.',
    },
    {
        controlItem: 'CSD Status at PO',
        controlObjective: 'Confirm the awarded supplier\'s CSD status was still active at the time of PO creation.',
    },
    {
        controlItem: 'Tax Clearance at Award Date',
        controlObjective: 'Verify that SARS tax compliance was active and unchanged at date of award.',
    },
    {
        controlItem: 'Award & Contracting Complaince',
        controlObjective: 'Compliance feedback for Award & Contracting',
    },

    {
        controlItem: 'Due Diligence Performed',
        controlObjective: 'Ensure a formal due diligence (incl. financial & site) was performed for the preferred bidder.',
    },
    {
        controlItem: 'Purchase Orders Issued',
        controlObjective: 'Confirm that the purchase order issued post-award matches the contract value and vendor.',
    },
    {
        controlItem: 'Subcontractor CIDB Grading',
        controlObjective: 'If subcontracting exists, confirm CIDB grading of subcontractors meets scope requirements.',
    },
    {
        controlItem: 'Form of Offer vs Award Amount',
        controlObjective: 'Check for inconsistencies between signed Form of Offer and awarded contract/PO values.',
    },
    {
        controlItem: 'Reporting & Filing Compliance',
        controlObjective: 'Ensure SCM and procurement records are correctly filed and reported per RW PROC 00180.',
    },
    {
        controlItem: 'Performance Monitoring Setup',
        controlObjective: 'Confirm post-award performance monitoring framework is in place for tracking deliverables.',
    },
    {
        controlItem: 'Post-Award & Compliance',
        controlObjective: 'Compliance feedback for Post-Award & Compliance',
    }
];

ProjectSchema.pre('save', function (next) {
    if (this.isNew) {
        const scmSubfolders = [
            "Needs Assessment",
            "Confirmation of Budget prior to going out to tender",
            "Bid Specification Committee (BSC) Specifications Approval & Budget Approval",
            "Approved Procurement Plan",
            "Minutes or Report of the Bid Evaluation Committee (BEC)",
            "Minutes or Report of the Bid Adjudication Committee (BAC)",
            "Resolutions from BSC",
            "Resolutions from BEC",
            "Resolutions from BAC",
            "Appointment letters of committee members",
            "Bid Notice and Invitation to Tender",
            "Feasibility study (non-subcontracting scope)",
            "Tender Advertisement",
            "Addenda and Clarifications",
            "Bid Closing Register",
            "Tender Registers and Transfer Lists",
            "Checks for Blacklisting of Companies",
            "Evaluation score sheets (functionality, price, preference points)",
            "Evaluation reports",
            "Financial Analysis",
            "Due Diligence",
            "Pre-Award Bid review by Internal Auditors",
            "Letter of Award",
            "Signed Acceptance of Tender Offer",
            "Signed Contract",
            "CSD Verification at Purchase Order (PO) Creation",
            "Tax Clearance verification at award date",
            "Original or certified copies of BBBEE certificates",
            "Purchase orders (POs) issued post-award",
            "Other Documents"
        ].map(name => ({ name }));

        this.folders = [
            {
                name: "SCM Process",
                subfolders: scmSubfolders
            },
            {
                name: "Non-Responsive",
                subfolders: []
            },
            {
                name: "Responsive",
                subfolders: []
            },
            {
                name: "Successful",
                subfolders: []
            }
        ];

        this.checklist = predefinedChecklistItems.map(item => ({
            controlItem: item.controlItem,
            controlObjective: item.controlObjective,
            category: item.category,
            answer: ""
        }));
    }
    next();
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default Project;