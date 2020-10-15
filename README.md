# Shopgate Engage - Bazaarvoice integration

Integration of [Bazaarvoice](https://www.bazaarvoice.com/) (software that allows brands and retailers to collect and display several types of authentic user-generated content on their e-commerce websites).
Bazaarvoice integration version: [5.4](https://developer.bazaarvoice.com/conversations-api/reference/v5.4)

## Setup
1. Add shop config `sgc_extension_settings` with value. Contact a dev to get the key.
    ```json
    {
        "@shopgate-project": {
            "redisSecret": "enterKeyHere"
        }
    }
    ```
2. deploy and configure extension


## Configuration

- `baseUrl` (string): base url of bazaarvoice integration (default: https://api.bazaarvoice.com)
- `apiKey` (string): API key for bazaarvoice integration
- `sortMap` (json): map of sort options
- `reviewsStatFilterFields` (json): additional filter fields when retrieving reviews
- `reviewSubmissionFields` (json): additional fields to submit along with review
- `cacheTTL` (number): cache lifetime in seconds for product ratings
- `ratingRoundingStep` (decimal): Rounding step for review rating, eg. 
    - 0.1: 3.2 -> 3.2
    - 0.5: 3.27 -> 3.5

## About Shopgate

Shopgate is the leading mobile commerce platform.

Shopgate offers everything online retailers need to be successful in mobile. Our leading
software-as-a-service (SaaS) enables online stores to easily create, maintain and optimize native
apps and mobile websites for the iPhone, iPad, Android smartphones and tablets.

## License
See the [LICENSE](./LICENSE.md) file for more information.
