# Overview

The DVP uses a verify end point for verification, based on traceability-
interop (related to VC-API). The goal of tha API is to do what verifying does

## Requirements: TI verify/testing

The requirements here are based mostly on what is tested by the traceability-
interop test suite and it's openapi spec

## Endpoint(s)

The endpoint is

POST: `/credentials/verify`

## response on successful verification attempt (for a valid OR invalid VC)

    
    
      verified*: boolean
      verifications*: [{
        title*: enum      # Allowed: Activation┃Expired┃Proof┃Revocation
        status*: enum     # Allowed: good┃bad
        description: string
      }]
     
    

Each object in the `verifications` array corresponds to one of the
verification types array corresponds to one of the verification types of check
in what does verifying do[].

The following rules decide which elements are present in a response:

  * `Proof` is always present
  * if the status of `Proof` is `bad`, then it should be the only element present in the response as nothing else can be confirmed.
  * If the VC to be verified supports any other featurs, then these should be present in the response Generally `verified` should be `true` if-and-only-if all of the verifications are `true`.
  * Typically a failed revocation/status check for any reason, including server unreachable, will result in the same `"status": "bad"`. The reason for the failure may be given in the optional `description` field however.

## Error codes

A bad request (400) status code should be returned for any kind of invalid or
unsupported VC. This is the case for invalid values (e.g. string instead of
object or missing parameters)

It is also true in the case of an unrecognised/unsupported VC feature. For
example an unsupported proof or credentailStatus `type`. A response should
indicate the problem field/type as unrecognised/unsupported.

An bad auth/unauthroised (401) error code should be returned in case of auth
problems.

To be clear, a failed signature check should _not_ result in a 400 (Bad
request), but a 200 (OK) with `verified` false.

## Handling OpenAttestation v3 documents

As OpenAttestation's library code assumes a slightly different paradigm when
verifying, functionly it is the same. More detail and a clear mapping of
responses is given elsewhere.

## Verify options

In the past some versions of VC-API have included options in the verify call,
about what kind of VC features it can accept (e.g. what kind of proof types,
formats, status types), but this is no longer recommended behaviour. This
amounts to a kind of business rule and should be handled independantly from,
and ideally prior to, verification.

## Todo:

  * Add linkes
  * ensure OpenAttestation result mapping docs are up to date. https://github.com/w3c-ccg/traceability-interop/pull/487



