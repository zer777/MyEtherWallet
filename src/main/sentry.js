import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';
import Vue from 'vue';
import { EventBus } from '@/core/plugins/eventBus';
import errorHandler from '@/main/errorHandler';
import { useGlobalStore } from '@/core/store/global';
import { useWalletStore } from '@/core/store/wallet';

// Sentry
Sentry.init({
  Vue,
  dsn: 'https://82c2004a8ba740e1b80f8589f9ca1770@o382951.ingest.sentry.io/5652727',
  integrations: [new Integrations.BrowserTracing()],
  maxBreadcrumbs: 0,
  environment: 'web',
  requestBodies: 'small',
  autoSessionTracking: false,
  release: NODE_ENV === 'production' ? VERSION : 'develop',
  beforeSend(event, hint) {
    const { network } = useGlobalStore();
    const { identifier } = useWalletStore();

    // eslint-disable-next-line
    console.error(hint.originalException || hint.syntheticException);
    const locNetwork = network.value ? network.value.type.name : '';
    const service = locNetwork ? network.value.service : '';
    const locIdentifier = identifier.value ? identifier.value : '';
    event.tags = {
      network: locNetwork,
      service: service,
      walletType: locIdentifier
    };
    const err = event.exception.values[0].value;
    if (errorHandler(err)) return null;
    return new Promise(resolve => {
      EventBus.$emit('issueModal', event, resolve);
    }).then(res => {
      return res === true ? event : null;
    });
  }
});
