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

const ProjectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
    },
    projectTeam: {
        type: String,
        required: false,
    },
    folders: [FolderSchema]
}, { timestamps: true });

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
    }
    next();
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

export default Project;