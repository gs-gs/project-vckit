
Sponsored by the Department of Homeland Security in the US to help make sure
VC's meet the needs of DHS. This is managed by Anil John, who was a leading
figure in driving the DID spec. The SVIP program is one of the largest efforts
focused on ensuring VCs can be used widely across business sectors and
national boundaries.

This program is relevant for the DVP as it provides a definite target profile
to target for interoperability. This document is meant a summary, with
distilled requirements in [SVIP VC profile for
DVP](https://confluence.bcz.gov.au/vc%2Dinterop-related-docs/Interop-and-
Silicon-Valley-Innovation-Program-for-VCs/SVIP-VC-profile-for-DVP)

The program sponsors 7 companies (previously 8) to pursue interop and both
identify and promote new standards to support DHS' needs across key areas.
Among the companies are 2 Canadian, 1 Austrian, 1 NZ, and 3 US based (none
based in Silicon Valley!)

A main activity to promote interop is through "plgufests", where the companies
come together test their inputs/outputs with each other. This results in an
interoperability matrix to see which company is compatible with which. In
reality, there are many matrices, one for each kind of interop.

The philosophy of the program is that rather than dictating a profile and
asking vendors for buy-in, they get vendors to work together in whatever way
they can agree on and document that as the 'profile'.

The main goal of this document is to snapshot this 'profile' as it relates to
DVP such that the DVP is aligned with the program.

    
    
      DHS Operational Components and Programs need to issue, validate and verify entitlements, attestations and certificates
      Citizenship and Immigration Status
      Employment Eligibility
      Essential Work and Task Licenses
      Organizational Identity & Supply Chain Security
    
    
    
      ... in concert with the global technical
      community, has actively worked together in a
      public and transparent manner to incubate and
      move into formal W3C standardization pathways
      via the W3C Credential Community Group (W3C
      CCG), a set of emerging specifications that
      ensure global, multi-vendor interoperability for
      this technology that is a critical requirement of
      meeting the needs of DHS
    

### Uses in US Govenrment:

Taken from [email to CCG from Anil
John](https://lists.w3.org/Archives/Public/public-
credentials/2022Oct/0080.html), the supporters of the profile are:

  1. U.S. Citizenship and Immigration Services (Slides 8-9) - The entity within the U.S. Government that is responsible for the benefits adjudication and issuance of some of the highest value credentials issued by the US federal government including the U.S. Permanent Resident Card, U.S. Employment Authorization Document, U.S. Certificates of Naturalization/Citizenship that are in turn consumed by the public sector and the private sector for border control, employment eligibility, residency eligibility, KYC and more. USCIS will be utilizing this profile to issue digital representations of immigration credentials while continuing to support the existing paper based issuance process. Syntax/Semantics/Vocabulary @ https://w3c-ccg.github.io/citizenship-vocab/<https://urldefense.us/v3/__https:/w3c-ccg.github.io/citizenship-vocab/__;!!BClRuOV5cvtbuNI!XTUw2g_i0CPNJA_7Ifv3yTqHIllQ6utz7yendzcAdgrTvlG7M2esZOsT0RBy8UkmwaxV$>

  2. U.S. Customs and Border Protection (Slides 10-11) - The largest customs organization in the world and responsible for facilitating global trade with the USA. CBP will be using this profile to digitize the trade documents that needs to be provided to CBP to ensure traceability and visibility of the supply chain of those goods before its import into the U.S. CBP's starting point on DID/VC based trade documents/credentials/attestations are related to the cross-border movement of Agriculture/Food, Steel, Oil, Natural Gas and E-Commerce products. Syntax/Semantics/Vocabulary @ https://w3c-ccg.github.io/traceability-vocab/<https://urldefense.us/v3/__https:/w3c-ccg.github.io/traceability-vocab/__;!!BClRuOV5cvtbuNI!XTUw2g_i0CPNJA_7Ifv3yTqHIllQ6utz7yendzcAdgrTvlG7M2esZOsT0RBy8WV1DCZV$>

  3. DHS Privacy Office (Slide 12) - Using W3C Decentralized Identifiers as a replacement for the Social Security Number (SSN) in DHS systems. See the “DHS Privacy Office FY21 Annual Report to the U.S. Congress” linked to from here (https://www.linkedin.com/posts/aniljohn_privacy-office-annual-reports-activity-6986730003061186561-OcCp)

## Refs

  * [DIF talks (post-Plugfest-2) (May 2021)](https://www.youtube.com/watch?v=Q9vOoE7qiDs)
  * [CCG mailing list 2021](https://lists.w3.org/Archives/Public/public-credentials/2021Mar/0101.html)
  * [slides summarising plugfest-2](https://docs.google.com/presentation/d/1MeeP7vDXb9CpSBfjTybYbo8qJfrrbrXCSJa0DklNe2k/edit)
  * [CCG thread (december)](https://lists.w3.org/Archives/Public/public-credentials/2022Dec/0000.html)
  * [W3C-CCG call with program director Anil John (audio)](https://w3c-ccg.github.io/meetings/2022-12-06/audio.ogg)

# Who's taking part

As of April 2021:

Personal credentials:

  * Danube Tech
  * Digital Bazaar
  * MATTR
  * SecureKey

Supply chain traceability:

  * Transmute
  * Spherity
  * mesur.io " Mavennet

(Spherity appears to have left the program since)

## Broad requirements

Different requirements for each stream

Personal credentials:

  * Eliminate "phone home" architecthure
  * Eliminate back-channel interactions verifiers and issuers
  * Support for selective disclosure

Traceability:

  * Automated interaction and discoverability
  * selective disclosure
  * Standard vocab

## Exchange/interaction APIs:

Much of the plugfest is about API's for credential exchange/discovery. For
protocols they've used CHAPI, VC-API, and some investigations in DIDComm.

Much of the traceability-interop spec is about disoverability of dids and
endpoints so that one party can easily start sending credentials via api
without human interaction.

The main focus of DVP is using existing exchange interactions 'enhanced' with
VCs, so that these elements of the SVIP are not strictly relevant.

Part of the exchange process is to use standard APIs

VC-API: https://w3c-ccg.github.io/vc-api/

Traceability-interop: https://w3c-ccg.github.io/traceability-interop/draft/

Traceability interop is nominally a narrowing/extension of VC-API, but in
practice there are some potential misalignments.

## Test suites:

However, DVP is already following the VC-API spec for VC interactions. This
means that the VC conformance test suites may be used to give evidence for
interoperability. With tweaks or an intermediate layer, it may also be
compatible with extensions of traceability-interop.


