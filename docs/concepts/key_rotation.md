
# Meaning of key revocation and rotation in the context of DIDs

A DID resolves to a DID document. The DID document lists any number of
`verificationMethod`s which are typically public keys. If a DID document is
changed such that a new method is added, and this method is then used for
future verifications (as opposed to the previous one). For the purposes of
this document, this will be called `rotation` to match the use of the term in
the [did:core spec](https://www.w3.org/TR/did-core/#verification-method-
rotation) where this is discussed in more detail. A common pattern is
"rotation followed by revocation" where the old verification is removed, or
"revoked" as the new one is added. More detail is given in the did:core spec.

# Long-lived credentials and protection against key compromise

The main reason to rotate/revoke keys is to limit impact in the event a key is
lost or compromised. The faster the rotation, the shorter a key is active, the
less the impact.

However, some VCs are meant to be long-lived, and these will typically become
invalidated once the public key corresponding to the private key used to sign
them has been revoked. That is, a public key needs to be active at least as
long as the life of the credentials it is used to sign. In some cases, such
long-active keys may present a security risk.

Most of these concerns are much more general the world of VCs and DIDs, and
general best-practices should of course be followed.

However, the following are some specific considerations.

  

## Short lived signing keys, long-lived public keys

If the main attack vector is exfiltration of signing keys (i.e. keys somehow
retrieved), then the attack surface is only dependent on how long the private
key exists and is independant on how long the public key exist.

In this case, if it is possible to rotate and destroy _signing_ keys
regularly, there is reduced risk in having public keys/verificationMethods
active in a DID document for long periods.

## DID methods with verifiable history and time-stamped VCs

A few DID methods provide a verifiable log of modifications to a DID document,
enabling something akin to versioning of them. In addition, there is an
emerging use of verifiable time-stamps, where e.g. the hash of a VC is added
to a distributed ledger or other service to prove that it existed at a given
date. The combination of these allows complex scenarios such as revoking a
method for future use after a certain date while allowing previously issued
documents to remain valid.

This pattern may become relevant in the next few years. However in the mean-
time, most common DID methods (such as did:web) don't have support for
versioning, and timestamps aren't common or standardised. That is, only the
current version of the DID document is generally available, and there is
nothing stopping an attacker from back-dating malicious VCs.

  

## Use short-lived "refreshable" credentials.

Another option is to use short-lived credentials that have to be 'refreshed'
every so often, where 'refresh' means get a new VC with a later expiry date.

The VC data model includes a `credentialRefresh` field for this purpose. This
field is an object giving a URL and a service type that a holder (or verifier,
potentially) may use to obtain a new credential. Possible types of refresh
method include manual (e.g. a URL for a website where a human may go and
request a new credential) to the automatic with authentication. In this case a
credential may be effectively valid for as long as needed. When a credential
is no longer needed to be valid, the refresh request will be rejected.

There are some caveats with using credentialRefresh however:

* It doesn't seem to be widely used/supported currently. In particular, the automatic methods are still evolving
* There is some ambiguity in the VCDM about what circumstances this can be used. An issue has been raised on the data model repository [here](https://github.com/w3c/vc-data-model/issues/1020).

  

# Proposal

While the latter option (DID methods with history and credentialRefresh) may
provide useful capaibilites in the future, their limited standardisation and
adoption makes interoperability a problem.

In the near term, the use of short-lived signing keys is easily implemented
and provides a significant boost to security.

Further, platforms may use different keys for short and long-lived credentials.
In both cases the signing keys will be short lived (e.g. 1 month), while the
public keys (verificationMethods) remain active for differing lengths.

If it is deemed that most credentials have a lifetime of 3 months, then short-
lived keys will have a lifetime of (signing_key lifetime + credential lifetim
= ) 4 months.

If a platform needs to support some credential with validity up to 2 years, then
long-lived verificaitonMethods may be kept for (24 + 1 = ) 25 months.

In this example, a DID document will contain up to 5 short lived public keys
and ~25 long-lived keys. This should be no problem, but it could be reduced
easily by changing validity periods.

