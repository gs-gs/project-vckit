# Overview

The rendering of a VC, that is converting the raw data (typically JSON) of a
VC into a human-friendly document, especially one that matches the appearance
of common trade documents, is an important feature of the VC-KIT. VC-KIT uses
OpenAttestation's renderer protocol for OpenAttestation documents as the
natural choice for those document types. For non-OA (i.e. 'SVIP') documents
the choice is less clear.

A review into the state of paper-friendly rendering options is (late 2022) is
[(here)](https://dev.azure.com/bcz-prod/digital-verification-
platform/_wiki/wikis/Project%20Wiki/165/Options-for-Rendering-Human-Readable-
VCs). This may be summarised briefly: OpenAttestation's approach is one of
only few options currently used in production, and it has almost certainly
been in use for the longest. Meanwhile, there is a rapidly evolving attempt
within the broader VC comunity to create a standard with some different
principles. As of writing, the latest draft of this is
[here](https://github.com/WebOfTrustInfo/rwot11-the-hague/blob/master/draft-
documents/rendering-vcs-snapshot-9-27-22.md). (Note that this is a snapshot.
It will go [here](https://github.com/WebOfTrustInfo/rwot11-the-
hague/tree/master/final-documents) when it's finished]). The general approach
is to use "render" field. An example below:

    
    
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
      ],
      "type": [...],
      "issuer": "https://example.edu/issuers/565049",
      "credentialSubject": {...},
      "render": [
        {
          "id": "https://svg.example/degree.svg",
          "type": "SvgRenderingHint",
          "mediaType": "image/svg+xml",
          "digestMultibase": "zQmAPdhyxzznFCwYxAp2dRerWC85Wg6wFl9G270iEu5h6JqW"
        }
      ],
      "proof": {...}
    }  
      
    
    

Here, the `render.id `field is a URL pointing to a generic template SVG. When
combined with data from the VC, it generates a human readable degree.
Meanwhile, `"type": "SvgRenderingHint"` and `"mediaType": "image/svg+xml"`
describes what's at the link and how it should be used: i.e. it's an xml
encodes SVG document and it's an SVG rendering template.

Finally `"digestMultibase":
"zQmAPdhyxzznFCwYxAp2dRerWC85Wg6wFl9G270iEu5h6JqW"` is a hash of the template,
to ensure that it's contents are not altered after the issuance of the VC

The spec also includes similar examples for an audio and Braile "rendering"s,
as well as HTML (as opposed to SVG)

## OpenArttestation Rendering Information

In an OA VC, the rendering information is given under OpenAttestationMetadata,
e.g.:

    
    
    "OpenAttestationMetadata":{
      "template": {
            "type": "EMBEDDED_RENDERER",
            "name": "CHAFTA_COO",
            "url": "https://generic-templates.tradetrust.io"
          },
    }
    

This process works as follows (more detail [here](https://github.com/Open-
Attestation/adr/blob/master/decentralised_rendering.md):

  * The page at `template.url` is fetched and placed in an iframe
  * The verifier page sens the

the VC is sent to the named URL (in this case generic-templates.tradetrust.io)
with the template type "CHAFTA COO" specified. This tells the rendering code
which template to use, and the fields will be filled out with data from the
VC.

  

## Non-OA (SVIP) VCs:

Since there is not yet a common standard for rendering human readable VCs,
most verifiers can't be expected to make use of any rendering data, however
it's presented. In this case, they should simply ignore it.

The rendering data is still useful for VC-KIT users however, as this is what is
seen when a QR code is scanned. It also allows a VC holder to print out a
paper document for compatibility with existing systems.

The question then is how to embed the data.

  

## Option 0

Use a rendering approach along the lines of the emerging RWoT proposal.

This means creating another template for each document type using e.g. SVG.

Advantages:

  * As aligned as possible with potential emerging standards
  * VCs become renderable 'offline'
  * No possibility of 'phoning home' may be useful in some circumstances

Disadvantages:

  * Two renderers have to be created for every document type.
  * While the closest thing to an 'emerging standard', it's still very much not a standard and is so far not used at all in production.
  * The standard is very much emerging- there is no guarantee that work down now will be useable down the track.
  * SVG may be limiting in terms of people with expertise.
  * There is no possibility for 'active' documents such as a redaction UI as done by TradeTrust's renderers

This approach should be reavaluated in the near term to check on adoption.

If it is possible to automatically generate a template such as this from an OA
style renderer this would also make the approach much more attractive.

In the below options, some different mechanics to use an OpenAttestation-style
renderer for non-OpenAttestation docs are considered.

## Option 1: Use identical syntax

Add an OpenAttestaionMetadata object (and associated json-ld @context) to SVIP
docs.

Advantage:

  * very few changes from our point of view, context is already hosted by Singapore.
  * exactly the same rendering/checking code for each doc type

Disadvantages:

  * Semanitcally ambiguous (Referencing OpenAttestation in a non-OpenAttestation document)
  * Relies on Singapore to host the context
  * The context is realtively big for a small feature
  * May be semantically confusing (openAttestation data on a non-OA document)
  * Plausible that some verifiers won't accept context json-ld from a third domain.

## Option 2: Use the same object but at the documetn root

Take the OA object and put it in the root under a different name, e.g.

"openAttestationRenderingTemplate": { "type": "EMBEDDED_RENDERER", "name":
"CHAFTA_COO", "url": "https://generic-templates.tradetrust.io" }

and write our own context with this.

Advantages:

  * Only change where to look for renderer, nothing else.
  * very similar rendering code for each doc type
  * If we manage to get OA's decentralised renderer standardised, it'll probably look something like this

Disadvantages

  * Semanitcally ambiguous (Referencing OpenAttestation in a non-OpenAttestation document)
  * will have to host our own minimal VCkit-specific context (though this will likely be nececssary for yet-to-build features in any case)
  * We will want to track movements of IMDA/govTech to standardise this.

## Option 3: Adapt an OA renderer as a specific type of the RWoT render
standard

Treat OA's renderer as a type of RWoT-style renderer. This is feasible because
both approaches require very similar information.

For example, we take the `template` data from an OpenAttestation document, and
fit it into a `render` obect.

E.g. the above example from an OpenAttestation document could become (for any
document):

    "render": [
    	{  		
    		"id": "https://generic-templates.tradetrust.io",
        	"type": "ReactEmbeddedRenderer2022", 
    		"name": "CHAFTA_COO"
    	}]

  

Advantages:

  * Aligning with emerging standards makes interacting with community easier
  * very nearly as simple to implement as the options above
  * the intention of the data to convey rendering information is clear (especially compared to those not familiar with OpenAttestation)
  * Likely to get support from Singapore (IMDA/govTech) as this aligns with their goals.

Disadvantages:

  * There is a question about alignment with the new standard's authors, as they are concerned about "phoning home" to the issuer (which OA's standard doesn't prevent)
  * Some work required to change top level renderer

## Proposal:

The three numbered options are very similar practically. The first is the
simplest to implement, but the last two aren't very different.

It seems that option 3 is likely to offer the best positioning w.r.t future
movements of the tech, as well as being the clearest for communicating
intention to potential verifiers.

  
