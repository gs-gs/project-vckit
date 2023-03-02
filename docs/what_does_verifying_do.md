
When a VC is verified, whatever path it arrives from (e.g. direct upload,
using a QR code, direct machine to machine) the main action that will occur is
that the VC will be "verified" (or not in case of failure). There'll likely
also be additional (path dependent steps) such as various kinds of validation
checks, but these are considered independent of verification.

For VC-KIT, verification occurs when a the VC is submitted to an API with an
endpoint like /credentials/verify. This peforms this process and give the
results to the user/caller.

So what doe sthis call do? A few things.

  * Proof: confirms document integrity and signature (these are inseperable)
  * issuer identity: The claimed issuer claims to control the signing key used
  * status: revocation status
  * activation: is the current date after the issuance date
  * expiry: is the current date before the credential expiration date.

N.B: In practise "issuer identity" is usually treated as part of checking the
"proof", such that "proof" should only be considered valid if any issuer
identity check also passes. More detail given in teh following sections.

More details on these are given below.

Further, there are also many possible checks that a successful verification
does _not_ imply. Some of these will also be addressed.

## Proof

Verifying first and foremost checks a VCs 'proof'. This step confirms that the
document presented was indeed signed by the stated method exactly as it
appears now.

Concretely, this usually means looking up the DID document of the claimed
issuer, and checking for a public key that the VC's proof names. On finding
this key, the rest of the VC (everything except the `proof`) is processed to
form a hash (like a document fingerprint). This hash is then combined with the
signature in the proof. If the result matches that public key, the test
passes.

If the proof fails, typically nothing can be said about whether it's been
tampered with, corrupted, or simply not signed correctly. A single bit error
in the document looks exactly the same as a completely fabricated one. A
failed proof could be completely innocent mistake, or it could be a fraud
attempt, but there is no way to tell. A failed proof means nothing can be
trusted.

Note that verification gives no opinion on whether the VC is fit for purpose.
It gives no opinion whether the statements in the VC are true, whether the
statements are sufficient for some business purpose, no statement on the
honesty or security of the issuer, and no opinion on the strength of the
cryptography used. These must be considered in a separate step.

  

## How do we know the issuer is?

Successful verification of a VC gives assurance that the claimed issuer did,
in fact, issuer the VC. Note however that the issuer we talk about here is not
"ACME corp, ABN 1234, address XYZ". It is instead usually something like
"did:web:acme-corp.com.au". More on this below.

The check of this typically happens at the same time as the proof. You'll note
that in the above section, the very first step of checking the proof is to
fetch the issuer's DID document and look for the public key there. This
constitutes a check of that the issuer actually claims the key that is
supposed to have signed the VC. This can be trusted because no-one but the
issuer should be able to control their DID document.

So a proof check typically can't even proceed unless the basic identity check
passes. But note that this identity check is totally meaningless unless the
proof passes, because a forgery could trivially claim that the issuer was
anyone at all. It's for this reason that 'proof' typically includes a the
basic issuer check. They are only meaningful together, and nothing else can be
useful said about a VC until they pass.

Considering the DID identity check more concretely, we note that many VCs will
likely be "issued" by a did:web. In this case the DID document is just a file
hosted on that website. Whoever successfully signed such a document must also
control the website specified in that did:web, in order to reference a key
they control in there (presuming they haven't stolen a key from the legitimate
controller). The trust in who the issuer is, is as strong (or weak) as the
trust in the owner and security of that website.

The way that DID documents are maintained, secured, and updated varies by
method. Individual method docs should be consulted as appropriate.

Note that OpenAttestation documents can have a slightly different mechanism
that is functionally very similar: if the issuer of an OA document is
"companyabc.com.au", this means that the key used to sign the document (often
in the form of a `did:ethr`, which behaves largely as a public key for this
purpose) is listed in the DNS record of companyabc.com.au. The security here
is as strong as the security of that DNS record.

Please note that verifying a VC does not do anything about checking who runs
the website, what their security practices are, or whether there is a typo
etc. This must be done external to verification.

## Revocation status

If an issuer has provided a mechanism for checking the VC's revocation status
using a supported method (or in principle other kinds of status such as
suspension, although these are currently not common), then verification will
do this check. Typically this involves checking a list of revoked credentials
published by the issuer.

If the issuer has specified a method that is not supported, verification will
result in an error.

## Period of validity (i.e. activation and expiration)

This is simply a check that the current date falls after the "issuance date"
(activation) and before the "expiration date" (expiration). No checks are made
whether these dates are good for specific purpose. They are meant as
requirements of the issuer: "Don't consider this VC valid outside these
dates". Note that while all credentials have an issuance date, not all have an
expiration.

## What it doesn't do: check if it's fit for purpose

Verify endpoint checks VC features. It _doesn't_ check whether these features
are fit for purpose.

Specifically it doesn't check:

  * Anything concrete about the issuer:
    * Is the owner of the issuer's DID (or website etc) a particular legal entity?
    * Is the issuer trustworthy?
    * Does the issuer have relevant knowledge, authority, or expertise?
    * Does the issuer maintaining good security?
    * Is there another entity with a very similar name?
  * Whether the credential contents (ie. anything in the credentialSubject) is fit for purpose.
    * Does this credential type have the fields the user wants?
    * Are the values entered in the fields valid or meaningful?
  * Whether the VC feature types are valid for a given use case. This might include:
    * Type of cryptography: some users/use cases may be ok with small RSA keys. Some won't.
    * whether the did:method is considered sufficiently secure.
    * whether the revocation method used is useful for this purpose.
    * Whether the expiration date used is a sensible one.


