declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      getLoginStatus: (callback: (response: FBLoginResponse) => void) => void;
      login: (
        callback: (response: FBLoginResponse) => void,
        options: {
          config_id?: string;
          response_type?: string;
          override_default_response_type?: boolean;
          scope?: string;
          extras?: Record<string, unknown>;
        }
      ) => void;
      AppEvents: {
        logPageView: () => void;
      };
    };
  }
}

export type FBLoginResponse = {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: {
    code?: string;
    accessToken?: string;
    expiresIn?: number;
    signedRequest?: string;
    userID?: string;
  };
};

export function loadFacebookSDK(appId: string): Promise<void> {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  });
}

export function checkLoginStatus(): Promise<FBLoginResponse> {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Facebook SDK not loaded"));
      return;
    }
    window.FB.getLoginStatus((response) => resolve(response));
  });
}

export async function launchWhatsAppSignup(): Promise<string> {
  if (!window.FB) {
    throw new Error("Facebook SDK not loaded");
  }

  const status = await checkLoginStatus();

  if (status.status === "connected" && status.authResponse?.code) {
    return status.authResponse.code;
  }

  return new Promise((resolve, reject) => {
    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          resolve(response.authResponse.code);
        } else {
          reject(new Error("Login cancelled or failed"));
        }
      },
      {
        config_id: "1864086677629331",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: 2,
        },
      }
    );
  });
}
